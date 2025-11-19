import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurveyStore } from '../stores/useSurveyStore';
import { Card, EmptyState, Button } from '../components';
import { BarChart } from '../components/charts';
import { analyzeTextColumn } from '../lib/analytics';
import { FileText, Upload as UploadIcon, Smile, Frown, Meh, TrendingUp } from 'lucide-react';

export function Insights() {
  const navigate = useNavigate();
  const { surveyData } = useSurveyStore();

  const textAnalytics = useMemo(() => {
    if (!surveyData) return [];

    const textColumns = surveyData.columns.filter(c => c.type === 'text');

    return textColumns.map(column => {
      const values = surveyData.rows
        .map(row => String(row[column.name] || ''))
        .filter(v => v.trim());

      return {
        columnName: column.name,
        analytics: analyzeTextColumn(values),
      };
    });
  }, [surveyData]);

  const getSentimentIcon = (sentiment: 'positive' | 'negative' | 'neutral') => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="h-6 w-6 text-success" />;
      case 'negative':
        return <Frown className="h-6 w-6 text-error" />;
      default:
        return <Meh className="h-6 w-6 text-gray-400" />;
    }
  };

  const getSentimentColor = (sentiment: 'positive' | 'negative' | 'neutral') => {
    switch (sentiment) {
      case 'positive':
        return 'bg-success-light text-success-dark';
      case 'negative':
        return 'bg-error-light text-error-dark';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (!surveyData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <EmptyState
            icon={<FileText className="h-12 w-12" />}
            title="No Survey Data"
            description="Upload a CSV file to get started with insights and text analytics."
            action={
              <Button onClick={() => navigate('/')} icon={<UploadIcon className="h-5 w-5" />}>
                Upload Data
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  if (textAnalytics.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <EmptyState
            icon={<FileText className="h-12 w-12" />}
            title="No Text Data Found"
            description="Your survey doesn't contain any text fields for sentiment analysis and insights."
            action={
              <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Survey Insights</h1>
          <p className="text-gray-600">
            Text analytics and sentiment analysis from <span className="font-medium">{surveyData.fileName}</span>
          </p>
        </div>

        {/* Text Analytics for each column */}
        <div className="space-y-8">
          {textAnalytics.map((item, index) => (
            <div key={index}>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                {item.columnName}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Overall Sentiment */}
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-700">Overall Sentiment</h3>
                    {getSentimentIcon(item.analytics.overallSentiment.sentiment)}
                  </div>
                  <p className={`text-3xl font-bold mb-2 ${getSentimentColor(item.analytics.overallSentiment.sentiment)} inline-block px-3 py-1 rounded-lg`}>
                    {item.analytics.overallSentiment.sentiment.toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Score: {item.analytics.overallSentiment.score > 0 ? '+' : ''}{item.analytics.overallSentiment.score.toFixed(1)}
                  </p>
                </Card>

                {/* Response Stats */}
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-700">Response Statistics</h3>
                    <FileText className="h-6 w-6 text-primary-500" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total:</span>
                      <span className="text-sm font-semibold">{item.analytics.totalResponses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg Length:</span>
                      <span className="text-sm font-semibold">{Math.round(item.analytics.averageLength)} chars</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Min / Max:</span>
                      <span className="text-sm font-semibold">
                        {item.analytics.minLength} / {item.analytics.maxLength}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Sentiment Words */}
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-700">Sentiment Words</h3>
                    <TrendingUp className="h-6 w-6 text-success" />
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-success-dark font-semibold">Positive:</span>
                      <p className="text-xs text-gray-600 mt-1">
                        {item.analytics.overallSentiment.positiveWords.slice(0, 5).join(', ') || 'None'}
                      </p>
                    </div>
                    <div className="mt-3">
                      <span className="text-xs text-error-dark font-semibold">Negative:</span>
                      <p className="text-xs text-gray-600 mt-1">
                        {item.analytics.overallSentiment.negativeWords.slice(0, 5).join(', ') || 'None'}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Word Frequencies */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card padding="lg">
                  <BarChart
                    data={item.analytics.wordFrequencies.slice(0, 10).map(w => ({
                      name: w.word,
                      value: w.count,
                    }))}
                    title="Most Common Words"
                    yAxisLabel="Frequency"
                    height={300}
                  />
                </Card>

                <Card padding="lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Themes</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.analytics.commonThemes.map((theme, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                  {item.analytics.commonThemes.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No themes detected</p>
                  )}
                </Card>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
          <Button variant="secondary" onClick={() => navigate('/')}>
            Upload New Data
          </Button>
        </div>
      </div>
    </div>
  );
}

