import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true, // Required for client-side usage
});

/**
 * Generate short (3-5 word) labels for long survey response values.
 * Used in pie/donut charts where full text overflows.
 */
export async function generateSmartLabels(
  questionName: string,
  labels: string[]
): Promise<Map<string, string>> {
  const result = new Map<string, string>();

  // Only shorten labels that are actually long
  const longLabels = labels.filter((l) => l.length > 25);
  if (longLabels.length === 0) return result;

  try {
    const prompt = `For the survey question "${questionName}", shorten these response option labels to 3-5 words each. Preserve the core meaning and keep them distinguishable from each other.

Labels:
${longLabels.map((l) => `- "${l}"`).join('\n')}

Return ONLY valid JSON mapping each original label to its short version.
Example: {"Original long label text here": "Short version"}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You shorten survey response labels to concise 3-5 word summaries. Return only valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const content = completion.choices[0].message.content?.trim() || '';
    // Strip markdown code fences if present
    const jsonStr = content.replace(/^```(?:json)?\n?|\n?```$/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    for (const [original, short] of Object.entries(parsed)) {
      if (typeof short === 'string') {
        result.set(original, short);
      }
    }
  } catch (error) {
    console.error('Failed to generate smart labels:', error);
  }

  return result;
}

