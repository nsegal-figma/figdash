import type { SurveyData } from '../../types/survey';
import { calculatePearsonCorrelation } from '../analytics/advanced';

export interface Insight {
  id: string;
  type: 'anomaly' | 'correlation' | 'segment' | 'trend' | 'surprise';
  title: string;
  description: string;
  confidence: number; // 0-1
  importance: number; // 0-1
  variables: string[];
  supportingData: any;
}

/**
 * Detect anomalies in categorical distributions
 */
function detectAnomalies(surveyData: SurveyData): Insight[] {
  const insights: Insight[] = [];
  const skipColumns = ['ResponseID', 'response_id', 'id', 'timestamp'];

  // Look for unexpected distributions in categorical data
  const categoricalColumns = surveyData.columns.filter(
    c => c.type === 'categorical' &&
    !skipColumns.some(skip => c.name.toLowerCase().includes(skip.toLowerCase()))
  );

  categoricalColumns.forEach(column => {
    const values = surveyData.rows.map(r => String(r[column.name])).filter(v => v);
    const counts = new Map<string, number>();

    values.forEach(v => counts.set(v, (counts.get(v) || 0) + 1));

    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);

    if (sorted.length >= 2) {
      const highest = sorted[0];
      const secondHighest = sorted[1];

      // Check for dominant category (>50% of responses)
      if (highest[1] / values.length > 0.5) {
        insights.push({
          id: `anomaly-${column.name}-dominant`,
          type: 'anomaly',
          title: `Strong ${column.name} skew detected`,
          description: `${highest[0]} represents ${((highest[1] / values.length) * 100).toFixed(0)}% of all responses, significantly higher than other categories.`,
          confidence: 0.9,
          importance: 0.7,
          variables: [column.name],
          supportingData: { category: highest[0], percentage: (highest[1] / values.length) * 100 },
        });
      }

      // Check for major gap between top 2 categories
      if (highest[1] > secondHighest[1] * 2) {
        insights.push({
          id: `anomaly-${column.name}-gap`,
          type: 'anomaly',
          title: `Large gap in ${column.name} distribution`,
          description: `${highest[0]} (${highest[1]}) is more than 2x larger than ${secondHighest[0]} (${secondHighest[1]}).`,
          confidence: 0.85,
          importance: 0.6,
          variables: [column.name],
          supportingData: { top: highest, second: secondHighest },
        });
      }
    }
  });

  return insights;
}

/**
 * Find correlations between numeric/satisfaction variables
 */
function detectCorrelations(surveyData: SurveyData): Insight[] {
  const insights: Insight[] = [];

  const numericColumns = surveyData.columns.filter(c => c.type === 'number');

  // Test all pairs
  for (let i = 0; i < numericColumns.length; i++) {
    for (let j = i + 1; j < numericColumns.length; j++) {
      const col1 = numericColumns[i];
      const col2 = numericColumns[j];

      const values1 = surveyData.rows.map(r => Number(r[col1.name])).filter(v => !isNaN(v) && v > 0);
      const values2 = surveyData.rows.map(r => Number(r[col2.name])).filter(v => !isNaN(v) && v > 0);

      if (values1.length < 5 || values2.length < 5) continue;

      const correlation = calculatePearsonCorrelation(
        values1.slice(0, Math.min(values1.length, values2.length)),
        values2.slice(0, Math.min(values1.length, values2.length))
      );

      // Only flag strong correlations
      if (Math.abs(correlation.coefficient) > 0.5) {
        insights.push({
          id: `correlation-${col1.name}-${col2.name}`,
          type: 'correlation',
          title: `${correlation.strength} ${correlation.direction} correlation found`,
          description: `${col1.name} and ${col2.name} show ${correlation.strength} ${correlation.direction} correlation (r=${correlation.coefficient.toFixed(2)}).`,
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
 * Detect significant differences between segments
 */
function detectSegmentDifferences(surveyData: SurveyData): Insight[] {
  const insights: Insight[] = [];

  // Common segmentation variables
  const segmentVars = surveyData.columns.filter(c =>
    c.type === 'categorical' &&
    ['role', 'company', 'size', 'department', 'team'].some(keyword =>
      c.name.toLowerCase().includes(keyword)
    )
  );

  const numericVars = surveyData.columns.filter(c =>
    c.type === 'number' &&
    c.name.toLowerCase().includes('satisfaction')
  );

  // For each segment variable, compare numeric outcomes
  segmentVars.forEach(segmentCol => {
    const segmentValues = surveyData.rows.map(r => String(r[segmentCol.name])).filter(v => v);
    const uniqueSegments = [...new Set(segmentValues)];

    if (uniqueSegments.length < 2) return;

    numericVars.forEach(numericCol => {
      // Compare top 2 segments
      if (uniqueSegments.length >= 2) {
        const seg1Values = surveyData.rows
          .filter(r => String(r[segmentCol.name]) === uniqueSegments[0])
          .map(r => Number(r[numericCol.name]))
          .filter(v => !isNaN(v) && v > 0);

        const seg2Values = surveyData.rows
          .filter(r => String(r[segmentCol.name]) === uniqueSegments[1])
          .map(r => Number(r[numericCol.name]))
          .filter(v => !isNaN(v) && v > 0);

        if (seg1Values.length < 3 || seg2Values.length < 3) return;

        const mean1 = seg1Values.reduce((sum, v) => sum + v, 0) / seg1Values.length;
        const mean2 = seg2Values.reduce((sum, v) => sum + v, 0) / seg2Values.length;
        const diff = Math.abs(mean1 - mean2);

        // Flag if difference is > 0.5 on numeric scale
        if (diff > 0.5) {
          const higher = mean1 > mean2 ? uniqueSegments[0] : uniqueSegments[1];
          const lower = mean1 > mean2 ? uniqueSegments[1] : uniqueSegments[0];
          const higherMean = Math.max(mean1, mean2);
          const lowerMean = Math.min(mean1, mean2);

          // Calculate percentage increase: (difference / lower mean) * 100
          // Cap at 100% to avoid confusing >100% messages
          const percentHigher = Math.min(((diff / lowerMean) * 100), 100).toFixed(0);

          insights.push({
            id: `segment-${segmentCol.name}-${numericCol.name}`,
            type: 'segment',
            title: `${higher} rates ${numericCol.name} significantly higher`,
            description: `${higher} (avg ${higherMean.toFixed(1)}) scores ${percentHigher}% higher on ${numericCol.name} than ${lower} (avg ${lowerMean.toFixed(1)}).`,
            confidence: Math.min(diff / 2, 1),
            importance: Math.min(diff / 5, 1),
            variables: [segmentCol.name, numericCol.name],
            supportingData: { segment1: higher, segment2: lower, mean1: higherMean, mean2: lowerMean },
          });
        }
      }
    });
  });

  return insights;
}

/**
 * Main function: Analyze survey data and return top insights
 */
export function discoverInsights(surveyData: SurveyData): Insight[] {
  const allInsights: Insight[] = [
    ...detectAnomalies(surveyData),
    ...detectCorrelations(surveyData),
    ...detectSegmentDifferences(surveyData),
  ];

  // Sort by importance and confidence
  const scored = allInsights.map(insight => ({
    ...insight,
    score: insight.importance * 0.6 + insight.confidence * 0.4,
  }));

  // Return top 7 insights
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 7);
}
