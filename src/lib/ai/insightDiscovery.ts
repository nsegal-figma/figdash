import type { SurveyData, Column } from '../../types/survey';
import { calculatePearsonCorrelation } from '../analytics/advanced';

export interface Insight {
  id: string;
  type: 'anomaly' | 'correlation' | 'segment' | 'trend' | 'surprise';
  title: string;
  description: string;
  confidence: number; // 0-1
  importance: number; // 0-1
  variables: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supportingData: Record<string, any>;
}

interface ColumnGroup {
  prefix: string;
  label: string;
  columns: Column[];
  /** Short human-readable names for each column in the group */
  humanNames: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SKIP_COLUMNS = ['responseid', 'response_id', 'id', 'timestamp', 'submitted', 'email'];

function shouldSkip(name: string): boolean {
  const lower = name.toLowerCase();
  return SKIP_COLUMNS.some(s => lower.includes(s));
}

/**
 * Turn raw column name like "Q1_Discover" or "Q4_Satisfaction_PrimaryResearch"
 * into a human-readable label: "Discover" or "Primary Research".
 */
function humanize(name: string, prefix?: string): string {
  let cleaned = name;
  // Strip the prefix (e.g. "Q1_")
  if (prefix) {
    cleaned = cleaned.replace(new RegExp(`^${escapeRegex(prefix)}`, 'i'), '');
  }
  // Strip leading underscores
  cleaned = cleaned.replace(/^_+/, '');
  // Split on underscores / camelCase
  cleaned = cleaned
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .trim();
  // Title-case each word
  return cleaned
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Detect column groups by shared prefix pattern (e.g. Q1_, Q2_, Section1_).
 * A group must have ≥ 2 columns to qualify.
 */
function detectColumnGroups(columns: Column[]): ColumnGroup[] {
  const prefixMap = new Map<string, Column[]>();

  for (const col of columns) {
    if (shouldSkip(col.name)) continue;
    // Match patterns like "Q1_", "Q2_", "Section1_", "Satisfaction_"
    const match = col.name.match(/^([A-Za-z]+\d*)[_]/);
    if (match) {
      const prefix = match[1] + '_';
      if (!prefixMap.has(prefix)) prefixMap.set(prefix, []);
      prefixMap.get(prefix)!.push(col);
    }
  }

  const groups: ColumnGroup[] = [];
  for (const [prefix, cols] of prefixMap) {
    if (cols.length >= 2) {
      groups.push({
        prefix,
        label: humanize(prefix.replace(/_$/, '')),
        columns: cols,
        humanNames: cols.map(c => humanize(c.name, prefix)),
      });
    }
  }
  return groups;
}

function isBinaryColumn(col: Column, rows: Record<string, string | number>[]): boolean {
  const unique = new Set<string>();
  for (const row of rows) {
    const v = String(row[col.name] ?? '').trim().toLowerCase();
    if (v && v !== 'undefined' && v !== 'null') unique.add(v);
    if (unique.size > 2) return false;
  }
  return unique.size === 2;
}

function getDistribution(
  colName: string,
  rows: Record<string, string | number>[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const v = String(row[colName] ?? '').trim();
    if (v && v !== 'undefined' && v !== 'null') {
      counts.set(v, (counts.get(v) || 0) + 1);
    }
  }
  return counts;
}

function positiveRate(colName: string, rows: Record<string, string | number>[]): number {
  const dist = getDistribution(colName, rows);
  let total = 0;
  let positive = 0;
  for (const [value, count] of dist) {
    total += count;
    const lower = value.toLowerCase();
    if (lower === 'yes' || lower === 'true' || lower === '1') {
      positive += count;
    }
  }
  return total > 0 ? positive / total : 0;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

// ---------------------------------------------------------------------------
// Detection functions
// ---------------------------------------------------------------------------

/**
 * Detect trends within column groups (e.g. adoption dropping across workflow stages).
 */
function detectGroupTrends(surveyData: SurveyData): Insight[] {
  const insights: Insight[] = [];
  const groups = detectColumnGroups(surveyData.columns);

  for (const group of groups) {
    const binaryCols = group.columns.filter(c => isBinaryColumn(c, surveyData.rows));

    // Binary group analysis (Yes/No across related questions)
    if (binaryCols.length >= 2) {
      const rates = binaryCols.map((col, i) => ({
        name: group.humanNames[group.columns.indexOf(col)] || humanize(col.name, group.prefix),
        colName: col.name,
        rate: positiveRate(col.name, surveyData.rows),
        index: i,
      }));

      rates.sort((a, b) => b.rate - a.rate);
      const highest = rates[0];
      const lowest = rates[rates.length - 1];
      const spread = highest.rate - lowest.rate;

      // Only flag if there's a meaningful spread (>15 percentage points)
      if (spread > 0.15 && rates.length >= 2) {
        const avgRate = mean(rates.map(r => r.rate));

        if (rates.length >= 3) {
          // Trend across multiple items
          insights.push({
            id: `trend-${group.prefix}-binary`,
            type: 'trend',
            title: `${group.label}: positive rate varies from ${(lowest.rate * 100).toFixed(0)}% to ${(highest.rate * 100).toFixed(0)}%`,
            description: `${highest.name} leads at ${(highest.rate * 100).toFixed(0)}%, while ${lowest.name} is lowest at ${(lowest.rate * 100).toFixed(0)}%. Average across ${group.label} items: ${(avgRate * 100).toFixed(0)}%.`,
            confidence: Math.min(0.7 + spread, 1),
            importance: Math.min(0.5 + spread * 1.5, 1),
            variables: binaryCols.map(c => c.name),
            supportingData: { group: group.label, rates, spread },
          });
        } else {
          // Just two items — direct comparison
          insights.push({
            id: `trend-${group.prefix}-binary-pair`,
            type: 'trend',
            title: `${highest.name} outpaces ${lowest.name} in ${group.label}`,
            description: `${highest.name} is at ${(highest.rate * 100).toFixed(0)}% vs ${lowest.name} at ${(lowest.rate * 100).toFixed(0)}% — a ${(spread * 100).toFixed(0)} percentage point gap.`,
            confidence: Math.min(0.7 + spread, 1),
            importance: Math.min(0.5 + spread, 1),
            variables: binaryCols.map(c => c.name),
            supportingData: { group: group.label, rates, spread },
          });
        }
      }
    }

    // Numeric group analysis (e.g. satisfaction ratings across topics)
    const numericCols = group.columns.filter(c => c.type === 'number');
    if (numericCols.length >= 2) {
      const stats = numericCols.map(col => {
        const vals = surveyData.rows
          .map(r => Number(r[col.name]))
          .filter(v => !isNaN(v) && v > 0);
        return {
          name: humanize(col.name, group.prefix),
          colName: col.name,
          mean: mean(vals),
          count: vals.length,
        };
      }).filter(s => s.count >= 3);

      if (stats.length >= 2) {
        stats.sort((a, b) => b.mean - a.mean);
        const best = stats[0];
        const worst = stats[stats.length - 1];
        const gap = best.mean - worst.mean;

        if (gap > 0.5) {
          insights.push({
            id: `trend-${group.prefix}-numeric`,
            type: 'trend',
            title: `${best.name} rated highest in ${group.label} (avg ${best.mean.toFixed(1)})`,
            description: `${best.name} (avg ${best.mean.toFixed(1)}) significantly outpaces ${worst.name} (avg ${worst.mean.toFixed(1)}) within ${group.label} questions.`,
            confidence: Math.min(0.6 + gap * 0.2, 1),
            importance: Math.min(0.5 + gap * 0.2, 1),
            variables: numericCols.map(c => c.name),
            supportingData: { group: group.label, stats, gap },
          });
        }
      }
    }
  }

  return insights;
}

/**
 * Cross-group comparisons: e.g. Q1 (workflow usage) vs Q2 (AI usage in workflows).
 */
function detectCrossGroupPatterns(surveyData: SurveyData): Insight[] {
  const insights: Insight[] = [];
  const groups = detectColumnGroups(surveyData.columns);

  // Find pairs of groups that share similar suffixes (e.g. Q1_Discover + Q2_Discover)
  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      const g1 = groups[i];
      const g2 = groups[j];

      // Find matching suffixes
      const g1Suffixes = new Map(g1.columns.map(c => [c.name.replace(g1.prefix, '').toLowerCase(), c]));
      const g2Suffixes = new Map(g2.columns.map(c => [c.name.replace(g2.prefix, '').toLowerCase(), c]));

      const commonSuffixes: string[] = [];
      for (const suffix of g1Suffixes.keys()) {
        if (g2Suffixes.has(suffix)) commonSuffixes.push(suffix);
      }

      if (commonSuffixes.length < 2) continue;

      // Compare binary rates between groups
      const diffs: { suffix: string; rate1: number; rate2: number; diff: number }[] = [];
      for (const suffix of commonSuffixes) {
        const col1 = g1Suffixes.get(suffix)!;
        const col2 = g2Suffixes.get(suffix)!;
        if (!isBinaryColumn(col1, surveyData.rows) || !isBinaryColumn(col2, surveyData.rows)) continue;

        const r1 = positiveRate(col1.name, surveyData.rows);
        const r2 = positiveRate(col2.name, surveyData.rows);
        diffs.push({ suffix, rate1: r1, rate2: r2, diff: r1 - r2 });
      }

      if (diffs.length < 2) continue;

      const avgDiff = mean(diffs.map(d => d.diff));
      const absDiff = Math.abs(avgDiff);

      if (absDiff > 0.1) {
        const higher = avgDiff > 0 ? g1 : g2;
        const lower = avgDiff > 0 ? g2 : g1;
        insights.push({
          id: `crossgroup-${g1.prefix}-${g2.prefix}`,
          type: 'surprise',
          title: `${higher.label} rates consistently higher than ${lower.label}`,
          description: `Across ${diffs.length} comparable items, ${higher.label} averages ${(absDiff * 100).toFixed(0)} percentage points higher than ${lower.label}.`,
          confidence: Math.min(0.6 + absDiff, 1),
          importance: Math.min(0.5 + absDiff * 1.5, 1),
          variables: [...g1.columns, ...g2.columns].map(c => c.name),
          supportingData: { group1: g1.label, group2: g2.label, diffs, avgDiff },
        });
      }
    }
  }

  return insights;
}

/**
 * Find meaningful anomalies in non-grouped categorical columns.
 * Skips trivial binary skew (Yes/No where one side > 50% is expected).
 */
function detectMeaningfulAnomalies(surveyData: SurveyData): Insight[] {
  const insights: Insight[] = [];
  const groupedNames = new Set(
    detectColumnGroups(surveyData.columns).flatMap(g => g.columns.map(c => c.name)),
  );

  const categoricalColumns = surveyData.columns.filter(
    c => c.type === 'categorical' && !shouldSkip(c.name) && !groupedNames.has(c.name),
  );

  for (const column of categoricalColumns) {
    const dist = getDistribution(column.name, surveyData.rows);
    const sorted = Array.from(dist.entries()).sort((a, b) => b[1] - a[1]);
    const total = Array.from(dist.values()).reduce((s, v) => s + v, 0);
    if (total === 0 || sorted.length < 2) continue;

    const binary = sorted.length === 2;
    const topPct = sorted[0][1] / total;

    // Skip trivial binary skew (Yes/No columns where majority is expected)
    if (binary && topPct < 0.85) continue;

    // For multi-category columns, flag strong dominance
    if (!binary && topPct > 0.6) {
      const label = humanize(column.name);
      insights.push({
        id: `anomaly-${column.name}-dominant`,
        type: 'anomaly',
        title: `${sorted[0][0]} dominates ${label} responses`,
        description: `${sorted[0][0]} accounts for ${(topPct * 100).toFixed(0)}% of ${label} responses (${sorted[0][1]} of ${total}). The next most common: ${sorted[1][0]} at ${((sorted[1][1] / total) * 100).toFixed(0)}%.`,
        confidence: 0.85,
        importance: Math.min(0.4 + topPct * 0.4, 0.8),
        variables: [column.name],
        supportingData: { distribution: Object.fromEntries(dist), total },
      });
    }

    // Very extreme binary skew (>85%) is noteworthy
    if (binary && topPct >= 0.85) {
      const label = humanize(column.name);
      insights.push({
        id: `anomaly-${column.name}-extreme`,
        type: 'anomaly',
        title: `Near-unanimous agreement on ${label}`,
        description: `${(topPct * 100).toFixed(0)}% of respondents selected "${sorted[0][0]}" for ${label}, suggesting strong consensus.`,
        confidence: 0.9,
        importance: 0.6,
        variables: [column.name],
        supportingData: { distribution: Object.fromEntries(dist), total },
      });
    }
  }

  return insights;
}

/**
 * Detect significant differences between demographic segments.
 * Compares both numeric outcomes AND binary adoption rates across segments.
 */
function detectSegmentDifferences(surveyData: SurveyData): Insight[] {
  const insights: Insight[] = [];

  const segmentVars = surveyData.columns.filter(c =>
    c.type === 'categorical' &&
    !shouldSkip(c.name) &&
    ['role', 'company', 'size', 'department', 'team', 'seniority', 'experience', 'title', 'group'].some(
      keyword => c.name.toLowerCase().includes(keyword),
    ),
  );

  if (segmentVars.length === 0) return insights;

  const groups = detectColumnGroups(surveyData.columns);

  for (const segmentCol of segmentVars) {
    const segmentDist = getDistribution(segmentCol.name, surveyData.rows);
    const segments = Array.from(segmentDist.entries())
      .filter(([, count]) => count >= 3) // Need minimum sample size
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Top 5 segments by count

    if (segments.length < 2) continue;

    const segLabel = humanize(segmentCol.name);

    // Compare binary group rates across segments
    for (const group of groups) {
      const binaryCols = group.columns.filter(c => isBinaryColumn(c, surveyData.rows));
      if (binaryCols.length === 0) continue;

      const segmentRates: { segment: string; avgRate: number; count: number }[] = [];
      for (const [segValue, segCount] of segments) {
        const segRows = surveyData.rows.filter(r => String(r[segmentCol.name]) === segValue);
        const rates = binaryCols.map(col => positiveRate(col.name, segRows));
        segmentRates.push({ segment: segValue, avgRate: mean(rates), count: segCount });
      }

      segmentRates.sort((a, b) => b.avgRate - a.avgRate);
      const highest = segmentRates[0];
      const lowest = segmentRates[segmentRates.length - 1];
      const diff = highest.avgRate - lowest.avgRate;

      if (diff > 0.15) {
        insights.push({
          id: `segment-${segmentCol.name}-${group.prefix}-binary`,
          type: 'segment',
          title: `${highest.segment} shows ${(diff * 100).toFixed(0)}pp higher ${group.label} adoption than ${lowest.segment}`,
          description: `By ${segLabel}: ${highest.segment} averages ${(highest.avgRate * 100).toFixed(0)}% across ${group.label} items vs ${lowest.segment} at ${(lowest.avgRate * 100).toFixed(0)}% (n=${highest.count} vs n=${lowest.count}).`,
          confidence: Math.min(0.6 + diff, 1),
          importance: Math.min(0.5 + diff * 1.5, 1),
          variables: [segmentCol.name, ...binaryCols.map(c => c.name)],
          supportingData: { segmentRates, group: group.label, diff },
        });
      }
    }

    // Compare numeric (e.g. satisfaction) columns across segments
    const numericCols = surveyData.columns.filter(
      c => c.type === 'number' && !shouldSkip(c.name),
    );

    for (const numCol of numericCols) {
      const numLabel = humanize(numCol.name);
      const segmentMeans: { segment: string; mean: number; count: number }[] = [];

      for (const [segValue] of segments) {
        const vals = surveyData.rows
          .filter(r => String(r[segmentCol.name]) === segValue)
          .map(r => Number(r[numCol.name]))
          .filter(v => !isNaN(v) && v > 0);
        if (vals.length >= 3) {
          segmentMeans.push({ segment: segValue, mean: mean(vals), count: vals.length });
        }
      }

      if (segmentMeans.length < 2) continue;

      segmentMeans.sort((a, b) => b.mean - a.mean);
      const best = segmentMeans[0];
      const worst = segmentMeans[segmentMeans.length - 1];
      const gap = best.mean - worst.mean;

      if (gap > 0.5) {
        insights.push({
          id: `segment-${segmentCol.name}-${numCol.name}`,
          type: 'segment',
          title: `${best.segment} rates ${numLabel} highest among ${segLabel} groups`,
          description: `${best.segment} (avg ${best.mean.toFixed(1)}) rates ${numLabel} higher than ${worst.segment} (avg ${worst.mean.toFixed(1)}) — a gap of ${gap.toFixed(1)} points.`,
          confidence: Math.min(gap / 2, 1),
          importance: Math.min(0.4 + gap * 0.2, 1),
          variables: [segmentCol.name, numCol.name],
          supportingData: { segmentMeans, gap },
        });
      }
    }
  }

  return insights;
}

/**
 * Correlations between numeric variables (kept, but with humanized descriptions).
 */
function detectCorrelations(surveyData: SurveyData): Insight[] {
  const insights: Insight[] = [];
  const numericColumns = surveyData.columns.filter(c => c.type === 'number' && !shouldSkip(c.name));

  for (let i = 0; i < numericColumns.length; i++) {
    for (let j = i + 1; j < numericColumns.length; j++) {
      const col1 = numericColumns[i];
      const col2 = numericColumns[j];

      const paired: { v1: number; v2: number }[] = [];
      for (const row of surveyData.rows) {
        const v1 = Number(row[col1.name]);
        const v2 = Number(row[col2.name]);
        if (!isNaN(v1) && !isNaN(v2) && v1 > 0 && v2 > 0) {
          paired.push({ v1, v2 });
        }
      }

      if (paired.length < 5) continue;

      const correlation = calculatePearsonCorrelation(
        paired.map(p => p.v1),
        paired.map(p => p.v2),
      );

      if (Math.abs(correlation.coefficient) > 0.5) {
        const label1 = humanize(col1.name);
        const label2 = humanize(col2.name);
        insights.push({
          id: `correlation-${col1.name}-${col2.name}`,
          type: 'correlation',
          title: `${label1} and ${label2} are ${correlation.strength}ly ${correlation.direction}ly correlated`,
          description: `Higher ${label1} scores tend to come with ${correlation.direction === 'positive' ? 'higher' : 'lower'} ${label2} scores (r=${correlation.coefficient.toFixed(2)}, n=${paired.length}).`,
          confidence: Math.abs(correlation.coefficient),
          importance: Math.abs(correlation.coefficient),
          variables: [col1.name, col2.name],
          supportingData: correlation,
        });
      }
    }
  }

  return insights;
}

/**
 * High-level summary stats that are genuinely interesting
 * (e.g. awareness-vs-usage gaps for standalone columns).
 */
function detectStandalonePatterns(surveyData: SurveyData): Insight[] {
  const insights: Insight[] = [];
  const groupedNames = new Set(
    detectColumnGroups(surveyData.columns).flatMap(g => g.columns.map(c => c.name)),
  );

  // Look for awareness-vs-usage or familiarity-vs-adoption patterns
  const awarenessKeywords = ['aware', 'familiar', 'know', 'heard'];
  const usageKeywords = ['use', 'adopt', 'implement', 'tried', 'apply'];

  const awarenessCol = surveyData.columns.find(
    c => !groupedNames.has(c.name) && awarenessKeywords.some(k => c.name.toLowerCase().includes(k)),
  );
  const usageCol = surveyData.columns.find(
    c => !groupedNames.has(c.name) && usageKeywords.some(k => c.name.toLowerCase().includes(k)),
  );

  if (awarenessCol && usageCol) {
    const awareRate = isBinaryColumn(awarenessCol, surveyData.rows)
      ? positiveRate(awarenessCol.name, surveyData.rows)
      : 0;
    const useRate = isBinaryColumn(usageCol, surveyData.rows)
      ? positiveRate(usageCol.name, surveyData.rows)
      : 0;

    if (awareRate > 0 && useRate > 0 && awareRate - useRate > 0.15) {
      const awareLabel = humanize(awarenessCol.name);
      const useLabel = humanize(usageCol.name);
      insights.push({
        id: `gap-awareness-usage`,
        type: 'surprise',
        title: `${awareLabel} is high (${(awareRate * 100).toFixed(0)}%) but ${useLabel} lags (${(useRate * 100).toFixed(0)}%)`,
        description: `There's a ${((awareRate - useRate) * 100).toFixed(0)} percentage point gap between awareness and actual usage, suggesting barriers to adoption.`,
        confidence: 0.85,
        importance: 0.8,
        variables: [awarenessCol.name, usageCol.name],
        supportingData: { awareRate, useRate, gap: awareRate - useRate },
      });
    }
  }

  return insights;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Analyze survey data and return top insights, using column grouping
 * and contextual analysis instead of naive per-column statistics.
 */
export function discoverInsights(surveyData: SurveyData): Insight[] {
  const allInsights: Insight[] = [
    ...detectGroupTrends(surveyData),
    ...detectCrossGroupPatterns(surveyData),
    ...detectMeaningfulAnomalies(surveyData),
    ...detectSegmentDifferences(surveyData),
    ...detectCorrelations(surveyData),
    ...detectStandalonePatterns(surveyData),
  ];

  // Score and deduplicate
  const scored = allInsights.map(insight => ({
    ...insight,
    score: insight.importance * 0.6 + insight.confidence * 0.4,
  }));

  // Return top 7 insights
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 7);
}
