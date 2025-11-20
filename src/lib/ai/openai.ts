import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true, // Required for client-side usage
});

export interface AISummaryResponse {
  summary: string;
  keyThemes: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  insights: string[];
}

/**
 * Generate AI summary of text responses using OpenAI GPT-4
 */
export async function generateAISummaryWithOpenAI(
  questionName: string,
  responses: string[]
): Promise<AISummaryResponse> {
  try {
    if (responses.length === 0) {
      return {
        summary: 'No responses available for analysis.',
        keyThemes: [],
        sentiment: 'neutral',
        insights: [],
      };
    }

    // Prepare the prompt
    const prompt = `You are analyzing survey responses for the question: "${questionName}".

Here are ${responses.length} responses:

${responses.slice(0, 50).map((r, i) => `${i + 1}. "${r}"`).join('\n')}

Please provide a comprehensive analysis in JSON format with:
1. summary: A 2-3 sentence paragraph summarizing the main findings
2. keyThemes: Array of 3-5 key themes/topics mentioned
3. sentiment: Overall sentiment (positive, negative, or neutral)
4. insights: Array of 2-3 actionable insights or patterns

Respond ONLY with valid JSON matching this structure:
{
  "summary": "...",
  "keyThemes": ["theme1", "theme2", "theme3"],
  "sentiment": "positive|negative|neutral",
  "insights": ["insight1", "insight2"]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert survey analyst. Analyze survey responses and provide concise, actionable insights in JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0].message.content?.trim() || '';

    // Parse JSON response
    try {
      const parsed = JSON.parse(content);
      return {
        summary: parsed.summary || 'Analysis complete.',
        keyThemes: parsed.keyThemes || [],
        sentiment: parsed.sentiment || 'neutral',
        insights: parsed.insights || [],
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      // Fallback if JSON parsing fails
      return {
        summary: content.substring(0, 300),
        keyThemes: [],
        sentiment: 'neutral',
        insights: [],
      };
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);
    // Return fallback summary on error
    return {
      summary: `Analysis of ${responses.length} responses. Key patterns detected across responses. Further analysis recommended.`,
      keyThemes: ['error generating themes'],
      sentiment: 'neutral',
      insights: ['API error occurred during analysis'],
    };
  }
}

/**
 * Generate summaries for multiple text columns
 */
export async function generateMultipleAISummaries(
  columns: Array<{ name: string; responses: string[] }>
): Promise<Map<string, AISummaryResponse>> {
  const summaries = new Map<string, AISummaryResponse>();

  // Process each column
  for (const column of columns) {
    const summary = await generateAISummaryWithOpenAI(column.name, column.responses);
    summaries.set(column.name, summary);
  }

  return summaries;
}
