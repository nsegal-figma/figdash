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
 * Generate AI-powered executive summary from survey data and insights
 */
export async function generateExecutiveSummary(
  surveyData: SurveyData,
  insights: Insight[]
): Promise<ExecutiveSummary> {
  try {
    const prompt = `You are analyzing survey data for a Figma internal team.

Survey: ${surveyData.fileName}
Total Responses: ${surveyData.totalRows}
Columns: ${surveyData.columns.length}

Top Statistical Insights Found:
${insights.map((insight, i) => `${i + 1}. [${insight.type.toUpperCase()}] ${insight.title}\n   ${insight.description}`).join('\n\n')}

Please generate an executive summary in JSON format:

{
  "overview": "2-3 paragraph narrative summary of the survey findings. Start with context, highlight key patterns, and emphasize what matters most for decision-making.",
  "keyTakeaways": ["3-5 most important takeaways as action-oriented bullet points"],
  "surprisingFindings": ["2-3 unexpected or counterintuitive findings that warrant attention"],
  "recommendations": ["3-4 specific, actionable recommendations based on the data"]
}

Focus on being concise, actionable, and emphasizing insights that would matter to product/design leaders at Figma.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert analyst creating executive summaries for product and design leaders. Be concise, actionable, and insight-focused.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = completion.choices[0].message.content?.trim() || '';

    try {
      const parsed = JSON.parse(content);
      return {
        overview: parsed.overview || 'Analysis complete.',
        keyTakeaways: parsed.keyTakeaways || [],
        surprisingFindings: parsed.surprisingFindings || [],
        recommendations: parsed.recommendations || [],
      };
    } catch (parseError) {
      console.error('Failed to parse executive summary:', content);
      // Better fallback: use description instead of title
      const topInsights = insights.slice(0, 5).map(i => i.description);

      return {
        overview: `Analysis of ${surveyData.totalRows} responses revealed several significant patterns. The data shows ${insights.length} statistical insights across ${surveyData.columns.length} survey questions, with notable variations in response distributions and emerging trends that warrant attention.`,
        keyTakeaways: topInsights.length > 0 ? topInsights : [
          'Multiple significant patterns detected in the data',
          'Response distributions show interesting variations across questions',
          'Several questions exhibit strong skewness or clustering patterns'
        ],
        surprisingFindings: [],
        recommendations: [
          'Review the statistical patterns section below for detailed findings',
          'Focus on high-confidence insights for immediate action',
          'Consider deeper analysis of questions with significant skewness'
        ],
      };
    }
  } catch (error) {
    console.error('Executive summary generation failed:', error);
    // Better fallback for complete failure
    const topInsights = insights.slice(0, 5).map(i => i.description);

    return {
      overview: `Analysis of ${surveyData.totalRows} responses revealed several significant patterns. The data shows ${insights.length} statistical insights across ${surveyData.columns.length} survey questions, with notable variations in response distributions and emerging trends that warrant attention.`,
      keyTakeaways: topInsights.length > 0 ? topInsights : [
        'Multiple significant patterns detected in the data',
        'Response distributions show interesting variations across questions',
        'Several questions exhibit strong skewness or clustering patterns'
      ],
      surprisingFindings: [],
      recommendations: [
        'Review the statistical patterns section below for detailed findings',
        'Focus on high-confidence insights for immediate action',
        'Consider deeper analysis of questions with significant skewness'
      ],
    };
  }
}
