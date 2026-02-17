import OpenAI from 'openai';
import type { Insight } from './insightDiscovery';
import type { SurveyData } from '../../types/survey';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

export interface ExecutiveSummary {
  overview: string; // 2-3 paragraphs
  keyTakeaways: string[]; // 3-5 bullet points
  surprisingFindings: string[];
  recommendations: string[];
}

/**
 * Build a data-rich context block for the LLM prompt.
 * Includes column groups, distributions, and key numbers.
 */
function buildDataContext(surveyData: SurveyData): string {
  const lines: string[] = [];

  // Column summary
  const categoricalCols = surveyData.columns.filter(c => c.type === 'categorical');
  const numericCols = surveyData.columns.filter(c => c.type === 'number');

  lines.push(`Dataset: ${surveyData.fileName}`);
  lines.push(`Total responses: ${surveyData.totalRows}`);
  lines.push(`Questions: ${surveyData.columns.length} (${categoricalCols.length} categorical, ${numericCols.length} numeric)`);
  lines.push('');

  // Detect column groups and describe them
  const prefixMap = new Map<string, string[]>();
  for (const col of surveyData.columns) {
    const match = col.name.match(/^([A-Za-z]+\d*)[_]/);
    if (match) {
      const prefix = match[1];
      if (!prefixMap.has(prefix)) prefixMap.set(prefix, []);
      prefixMap.get(prefix)!.push(col.name);
    }
  }

  for (const [prefix, cols] of prefixMap) {
    if (cols.length >= 2) {
      const suffixes = cols.map(c => c.replace(new RegExp(`^${prefix}_`), ''));
      lines.push(`Question group "${prefix}": ${suffixes.join(', ')}`);
    }
  }

  lines.push('');

  // Top-level distributions for categorical columns (first 8)
  for (const col of categoricalCols.slice(0, 8)) {
    const counts = new Map<string, number>();
    let total = 0;
    for (const row of surveyData.rows) {
      const v = String(row[col.name] ?? '').trim();
      if (v && v !== 'undefined' && v !== 'null') {
        counts.set(v, (counts.get(v) || 0) + 1);
        total++;
      }
    }
    if (total === 0) continue;

    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const summary = sorted.map(([val, count]) => `${val}: ${((count / total) * 100).toFixed(0)}%`).join(', ');
    lines.push(`${col.name}: ${summary} (n=${total})`);
  }

  // Numeric column averages
  for (const col of numericCols.slice(0, 8)) {
    const vals = surveyData.rows
      .map(r => Number(r[col.name]))
      .filter(v => !isNaN(v) && v > 0);
    if (vals.length === 0) continue;

    const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    lines.push(`${col.name}: avg=${avg.toFixed(1)}, range=[${min}–${max}], n=${vals.length}`);
  }

  return lines.join('\n');
}

/**
 * Generate a local (no-LLM) executive summary by synthesizing insights
 * into narrative text. Avoids generic filler.
 */
function generateLocalSummary(
  surveyData: SurveyData,
  insights: Insight[],
): ExecutiveSummary {
  const trends = insights.filter(i => i.type === 'trend');
  const segments = insights.filter(i => i.type === 'segment');
  const surprises = insights.filter(i => i.type === 'surprise');
  const anomalies = insights.filter(i => i.type === 'insight');
  const correlations = insights.filter(i => i.type === 'correlation');

  // Build overview from actual insights
  const overviewParts: string[] = [];

  overviewParts.push(
    `Analysis of ${surveyData.totalRows} survey responses across ${surveyData.columns.length} questions revealed ${insights.length} notable findings.`,
  );

  if (trends.length > 0) {
    overviewParts.push(trends[0].description);
  }
  if (segments.length > 0) {
    overviewParts.push(segments[0].description);
  }
  if (surprises.length > 0) {
    overviewParts.push(surprises[0].description);
  }

  // Key takeaways: top insights, described naturally
  const keyTakeaways = insights
    .slice(0, 5)
    .map(i => i.description);

  // Surprising findings
  const surprisingFindings = [
    ...surprises.map(s => s.description),
    ...anomalies.map(a => a.description),
  ].slice(0, 3);

  // Recommendations: derive from insight types
  const recommendations: string[] = [];
  if (trends.length > 0) {
    const trendInsight = trends[0];
    const lowArea = trendInsight.supportingData?.rates
      ? trendInsight.supportingData.rates[trendInsight.supportingData.rates.length - 1]?.name
      : null;
    if (lowArea) {
      recommendations.push(`Investigate why ${lowArea} lags behind other areas and identify specific barriers`);
    }
  }
  if (segments.length > 0) {
    recommendations.push(`Explore what drives the differences between segments to inform targeted strategies`);
  }
  if (surprises.length > 0) {
    recommendations.push(`Address the awareness-to-action gap by reducing friction in adoption workflows`);
  }
  if (correlations.length > 0) {
    recommendations.push(`Leverage the identified correlations to predict and improve outcomes`);
  }
  if (recommendations.length === 0) {
    recommendations.push(`Dig deeper into the top-rated and lowest-rated areas to understand what drives satisfaction`);
  }

  return {
    overview: overviewParts.join(' '),
    keyTakeaways,
    surprisingFindings,
    recommendations,
  };
}

/**
 * Generate AI-powered executive summary from survey data and insights.
 * Falls back to a local narrative summary if the LLM call fails.
 */
export async function generateExecutiveSummary(
  surveyData: SurveyData,
  insights: Insight[],
): Promise<ExecutiveSummary> {
  // If no API key, skip the LLM call entirely
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    return generateLocalSummary(surveyData, insights);
  }

  try {
    const dataContext = buildDataContext(surveyData);

    const prompt = `You are analyzing survey results. Here is the raw data context:

${dataContext}

Key insights discovered from the data:
${insights.map((insight, i) => `${i + 1}. [${insight.type.toUpperCase()}] ${insight.title}\n   ${insight.description}`).join('\n\n')}

Generate an executive summary in JSON format. Be specific — reference actual numbers, question names, and segments from the data above. Do NOT use generic phrases like "significant patterns detected" or "interesting variations". Every sentence should contain a concrete finding.

{
  "overview": "2-3 paragraph narrative. Start with the most important finding. Reference specific numbers and comparisons.",
  "keyTakeaways": ["3-5 specific, data-backed takeaway statements"],
  "surprisingFindings": ["2-3 unexpected findings with specific numbers"],
  "recommendations": ["3-4 actionable recommendations tied to specific findings"]
}

Return ONLY the JSON object, no markdown fencing.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a data analyst. Be specific and concrete — always cite numbers. Never use filler phrases. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 1200,
    });

    const content = completion.choices[0].message.content?.trim() || '';

    // Strip markdown code fences if present
    const jsonStr = content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');

    const parsed = JSON.parse(jsonStr);
    return {
      overview: parsed.overview || '',
      keyTakeaways: Array.isArray(parsed.keyTakeaways) ? parsed.keyTakeaways : [],
      surprisingFindings: Array.isArray(parsed.surprisingFindings) ? parsed.surprisingFindings : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
    };
  } catch (error) {
    console.error('Executive summary generation failed, using local fallback:', error);
    return generateLocalSummary(surveyData, insights);
  }
}
