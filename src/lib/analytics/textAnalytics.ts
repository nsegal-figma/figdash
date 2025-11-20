import Sentiment from 'sentiment';

const sentiment = new Sentiment();

export interface SentimentResult {
  score: number;
  comparative: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  positiveWords: string[];
  negativeWords: string[];
}

export interface WordFrequency {
  word: string;
  count: number;
  percentage: number;
}

export interface TextAnalytics {
  totalResponses: number;
  averageLength: number;
  minLength: number;
  maxLength: number;
  wordFrequencies: WordFrequency[];
  commonThemes: string[];
  overallSentiment: SentimentResult;
  representativeQuotes: string[];
  allResponses: string[];
  aiSummary: string;
}

export function analyzeSentiment(text: string): SentimentResult {
  const result = sentiment.analyze(text);

  let sentimentLabel: 'positive' | 'negative' | 'neutral';
  if (result.score > 0) {
    sentimentLabel = 'positive';
  } else if (result.score < 0) {
    sentimentLabel = 'negative';
  } else {
    sentimentLabel = 'neutral';
  }

  return {
    score: result.score,
    comparative: result.comparative,
    sentiment: sentimentLabel,
    positiveWords: result.positive,
    negativeWords: result.negative,
  };
}

export function analyzeMultipleSentiments(texts: string[]): SentimentResult {
  const results = texts.filter(t => t && t.trim()).map(analyzeSentiment);

  if (results.length === 0) {
    return {
      score: 0,
      comparative: 0,
      sentiment: 'neutral',
      positiveWords: [],
      negativeWords: [],
    };
  }

  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const averageComparative = results.reduce((sum, r) => sum + r.comparative, 0) / results.length;
  
  const allPositiveWords = new Set<string>();
  const allNegativeWords = new Set<string>();
  
  results.forEach(r => {
    r.positiveWords.forEach(w => allPositiveWords.add(w));
    r.negativeWords.forEach(w => allNegativeWords.add(w));
  });

  let overallSentiment: 'positive' | 'negative' | 'neutral';
  if (totalScore > 0) {
    overallSentiment = 'positive';
  } else if (totalScore < 0) {
    overallSentiment = 'negative';
  } else {
    overallSentiment = 'neutral';
  }

  return {
    score: totalScore,
    comparative: averageComparative,
    sentiment: overallSentiment,
    positiveWords: Array.from(allPositiveWords),
    negativeWords: Array.from(allNegativeWords),
  };
}

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'i', 'you', 'we', 'they', 'this',
  'but', 'have', 'had', 'what', 'when', 'where', 'who', 'which',
  'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
  'own', 'same', 'so', 'than', 'too', 'very', 'can', 'just',
  'should', 'now', 'also', 'me', 'my', 'our', 'their', 'your'
]);

export function calculateWordFrequencies(texts: string[], topN: number = 20): WordFrequency[] {
  const wordCounts = new Map<string, number>();
  let totalWords = 0;

  texts.forEach(text => {
    if (!text || !text.trim()) return;

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !STOP_WORDS.has(word));

    words.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      totalWords++;
    });
  });

  return Array.from(wordCounts.entries())
    .map(([word, count]) => ({
      word,
      count,
      percentage: (count / totalWords) * 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

export function extractKeywords(texts: string[], topN: number = 10): string[] {
  const frequencies = calculateWordFrequencies(texts, topN);
  return frequencies.map(f => f.word);
}

export function calculateResponseLengthStats(texts: string[]): {
  average: number;
  min: number;
  max: number;
  median: number;
} {
  const lengths = texts
    .filter(t => t && t.trim())
    .map(t => t.trim().length);

  if (lengths.length === 0) {
    return { average: 0, min: 0, max: 0, median: 0 };
  }

  const sum = lengths.reduce((acc, len) => acc + len, 0);
  const sorted = [...lengths].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];

  return {
    average: sum / lengths.length,
    min: Math.min(...lengths),
    max: Math.max(...lengths),
    median,
  };
}

export function generateAISummary(texts: string[], sentiment: SentimentResult, themes: string[]): string {
  if (texts.length === 0) return 'No responses available for analysis.';

  const totalResponses = texts.length;
  const sentimentLabel = sentiment.sentiment;
  const topThemes = themes.slice(0, 3);

  // Build summary paragraph
  let summary = `Based on ${totalResponses} response${totalResponses !== 1 ? 's' : ''}, `;

  // Add sentiment context
  if (sentimentLabel === 'positive') {
    summary += 'respondents expressed generally positive views. ';
  } else if (sentimentLabel === 'negative') {
    summary += 'respondents expressed concerns and challenges. ';
  } else {
    summary += 'respondents shared balanced perspectives. ';
  }

  // Add theme analysis
  if (topThemes.length > 0) {
    summary += 'Key themes include ';
    if (topThemes.length === 1) {
      summary += `${topThemes[0]}. `;
    } else if (topThemes.length === 2) {
      summary += `${topThemes[0]} and ${topThemes[1]}. `;
    } else {
      summary += `${topThemes[0]}, ${topThemes[1]}, and ${topThemes[2]}. `;
    }
  }

  // Add insight about response patterns
  const shortResponses = texts.filter(t => t.length < 50).length;
  const longResponses = texts.filter(t => t.length > 100).length;

  if (longResponses > totalResponses * 0.3) {
    summary += 'Many respondents provided detailed, substantive feedback. ';
  } else if (shortResponses > totalResponses * 0.5) {
    summary += 'Responses tend to be brief and direct. ';
  }

  // Add sentiment detail if strong
  if (Math.abs(sentiment.score) > totalResponses * 0.5) {
    if (sentiment.sentiment === 'positive') {
      summary += 'Overall sentiment is notably positive.';
    } else if (sentiment.sentiment === 'negative') {
      summary += 'Overall sentiment indicates areas requiring attention.';
    }
  }

  return summary.trim();
}

export function extractRepresentativeQuotes(texts: string[], maxQuotes: number = 5): string[] {
  const validTexts = texts.filter(t => t && t.trim());

  if (validTexts.length === 0) return [];

  // Analyze sentiment for each text
  const textsWithSentiment = validTexts.map(text => ({
    text,
    sentiment: analyzeSentiment(text),
    length: text.length,
  }));

  // Get a mix of positive, negative, and neutral quotes
  const positive = textsWithSentiment.filter(t => t.sentiment.sentiment === 'positive');
  const negative = textsWithSentiment.filter(t => t.sentiment.sentiment === 'negative');

  const quotes: string[] = [];

  // Add most positive quote
  if (positive.length > 0) {
    const mostPositive = positive.sort((a, b) => b.sentiment.score - a.sentiment.score)[0];
    quotes.push(mostPositive.text);
  }

  // Add most negative quote
  if (negative.length > 0) {
    const mostNegative = negative.sort((a, b) => a.sentiment.score - b.sentiment.score)[0];
    quotes.push(mostNegative.text);
  }

  // Add longest substantive response
  const substantive = validTexts.filter(t => t.length > 50).sort((a, b) => b.length - a.length);
  if (substantive.length > 0 && !quotes.includes(substantive[0])) {
    quotes.push(substantive[0]);
  }

  // Fill remaining slots with diverse quotes
  const remaining = validTexts.filter(t => !quotes.includes(t));
  const step = Math.floor(remaining.length / (maxQuotes - quotes.length)) || 1;
  for (let i = 0; i < remaining.length && quotes.length < maxQuotes; i += step) {
    quotes.push(remaining[i]);
  }

  return quotes.slice(0, maxQuotes);
}

export function analyzeTextColumn(texts: string[]): TextAnalytics {
  const validTexts = texts.filter(t => t && t.trim());

  if (validTexts.length === 0) {
    return {
      totalResponses: 0,
      averageLength: 0,
      minLength: 0,
      maxLength: 0,
      wordFrequencies: [],
      commonThemes: [],
      overallSentiment: {
        score: 0,
        comparative: 0,
        sentiment: 'neutral',
        positiveWords: [],
        negativeWords: [],
      },
      representativeQuotes: [],
      allResponses: [],
      aiSummary: 'No responses available for analysis.',
    };
  }

  const lengthStats = calculateResponseLengthStats(validTexts);
  const wordFrequencies = calculateWordFrequencies(validTexts, 20);
  const commonThemes = extractKeywords(validTexts, 10);
  const overallSentiment = analyzeMultipleSentiments(validTexts);
  const representativeQuotes = extractRepresentativeQuotes(validTexts, 5);
  const aiSummary = generateAISummary(validTexts, overallSentiment, commonThemes);

  return {
    totalResponses: validTexts.length,
    averageLength: lengthStats.average,
    minLength: lengthStats.min,
    maxLength: lengthStats.max,
    wordFrequencies,
    commonThemes,
    overallSentiment,
    representativeQuotes,
    allResponses: validTexts,
    aiSummary,
  };
}





