/**
 * AI-Powered Cleaning Recommendations
 * Use OpenAI to suggest optimal thresholds and settings
 */

import OpenAI from 'openai';
import type { SurveyData } from '../../types/survey';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

export interface ThresholdRecommendations {
  speeders: {
    recommendedThreshold: number;
    reasoning: string;
    confidence: 'high' | 'medium' | 'low';
  };
  straightLiners: {
    recommendedVariance: number;
    reasoning: string;
    confidence: 'high' | 'medium' | 'low';
  };
  outliers: {
    recommendedMethod: 'iqr' | 'zscore';
    recommendedAction: 'flag' | 'remove' | 'cap';
    reasoning: string;
    confidence: 'high' | 'medium' | 'low';
  };
  missingData: {
    recommendedStrategy: string;
    reasoning: string;
    confidence: 'high' | 'medium' | 'low';
  };
  overall: string;
}

/**
 * Analyze survey data and get AI recommendations
 */
export async function getAIRecommendations(
  surveyData: SurveyData
): Promise<ThresholdRecommendations> {
  try {
    // Calculate survey statistics
    const durationCol = surveyData.columns.find((c) =>
      c.name.toLowerCase().includes('duration')
    );

    let durationStats = '';
    if (durationCol) {
      const durations = surveyData.rows
        .map((r) => Number(r[durationCol.name]))
        .filter((d) => !isNaN(d) && d > 0);

      if (durations.length > 0) {
        const sorted = [...durations].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const p5 = sorted[Math.floor(sorted.length * 0.05)];
        const p95 = sorted[Math.floor(sorted.length * 0.95)];

        durationStats = `
Duration Statistics:
- Median: ${median}s
- Range: ${min}s - ${max}s
- 5th percentile: ${p5}s
- 95th percentile: ${p95}s
`;
      }
    }

    // Count Likert columns
    const likertColumns = surveyData.columns.filter(
      (c) =>
        c.type === 'categorical' &&
        (c.name.toLowerCase().includes('satisfaction') ||
          c.name.toLowerCase().includes('satisfied') ||
          c.name.toLowerCase().includes('rating') ||
          c.name.toLowerCase().includes('agree'))
    );

    // Calculate missing data percentages
    const missingDataStats = surveyData.columns
      .map((col) => {
        const missing = surveyData.rows.filter(
          (r) => r[col.name] === '' || r[col.name] == null
        ).length;
        const percentage = (missing / surveyData.rows.length) * 100;
        return { column: col.name, percentage };
      })
      .filter((s) => s.percentage > 10)
      .slice(0, 5);

    const prompt = `You are a survey data quality expert. Analyze this survey and recommend optimal cleaning thresholds.

Survey Characteristics:
- ${surveyData.totalRows} responses
- ${surveyData.columns.length} total columns
- ${likertColumns.length} Likert scale questions (for straight-liner detection)
${durationStats}

${missingDataStats.length > 0 ? `Columns with >10% missing data:
${missingDataStats.map((s) => `- ${s.column}: ${s.percentage.toFixed(1)}%`).join('\n')}` : ''}

Please provide recommendations in JSON format:

{
  "speeders": {
    "recommendedThreshold": number (in seconds),
    "reasoning": "1-2 sentence explanation",
    "confidence": "high" | "medium" | "low"
  },
  "straightLiners": {
    "recommendedVariance": number (0-2 range, lower = stricter),
    "reasoning": "1-2 sentence explanation",
    "confidence": "high" | "medium" | "low"
  },
  "outliers": {
    "recommendedMethod": "iqr" | "zscore",
    "recommendedAction": "flag" | "remove" | "cap",
    "reasoning": "1-2 sentence explanation",
    "confidence": "high" | "medium" | "low"
  },
  "missingData": {
    "recommendedStrategy": "leave" | "impute-mean" | "impute-median" | "impute-mode" | "remove",
    "reasoning": "1-2 sentence explanation",
    "confidence": "high" | "medium" | "low"
  },
  "overall": "2-3 sentence summary of your recommendations"
}

Focus on being conservative (avoid removing too much data) but effective (catch clear quality issues).`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a survey data quality expert providing threshold recommendations. Be specific, practical, and conservative.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const content = completion.choices[0].message.content?.trim() || '';

    try {
      // Try to parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);

      return {
        speeders: parsed.speeders || {
          recommendedThreshold: 60,
          reasoning: 'Default threshold based on typical survey length',
          confidence: 'low',
        },
        straightLiners: parsed.straightLiners || {
          recommendedVariance: 0.5,
          reasoning: 'Moderate threshold to catch obvious patterns',
          confidence: 'low',
        },
        outliers: parsed.outliers || {
          recommendedMethod: 'iqr',
          recommendedAction: 'flag',
          reasoning: 'Conservative approach to preserve data',
          confidence: 'low',
        },
        missingData: parsed.missingData || {
          recommendedStrategy: 'leave',
          reasoning: 'Preserve original data by default',
          confidence: 'low',
        },
        overall: parsed.overall || 'Using default recommendations.',
      };
    } catch (parseError) {
      console.error('Failed to parse AI recommendations:', content);
      throw new Error('Failed to parse recommendations from AI');
    }
  } catch (error) {
    console.error('AI recommendations failed:', error);
    throw error;
  }
}
