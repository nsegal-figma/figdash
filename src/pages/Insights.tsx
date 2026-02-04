import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurveyStore } from '../stores/useSurveyStore';
import { Card, EmptyState, Button, LoadingSpinner } from '../components';
import { analyzeTextColumn } from '../lib/analytics';
import { FileText, Upload as UploadIcon, Smile, Frown, Meh } from 'lucide-react';

export function Insights() {
  const navigate = useNavigate();
  const { surveyData, aiSummaries, isGeneratingAI } = useSurveyStore();

  // Redirect to upload if no data
  useEffect(() => {
    if (!surveyData) {
      navigate('/', { replace: true });
    }
  }, [surveyData, navigate]);

  const textAnalytics = useMemo(() => {
    if (!surveyData) return [];

    // Skip ID columns and only process actual text responses
    const skipColumns = ['ResponseID', 'response_id', 'id', 'timestamp', 'Timestamp'];
    const textColumns = surveyData.columns.filter(c =>
      c.type === 'text' &&
      !skipColumns.some(skip => c.name.toLowerCase().includes(skip.toLowerCase()))
    );

    return textColumns.map(column => {
      const values = surveyData.rows
        .map(row => String(row[column.name] || ''))
        .filter(v => v.trim() && v.length > 3);

      return {
        columnName: column.name,
        analytics: analyzeTextColumn(values),
        aiSummary: aiSummaries.get(column.name) || null,
      };
    }).filter(item => item.analytics.totalResponses > 0);
  }, [surveyData, aiSummaries]);

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

  if (!surveyData) {
    return (
      <div className="min-h-screen bg-white py-12 px-6">
        <div>
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
      <div className="min-h-screen bg-white py-12 px-6">
        <div>
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
    <div className="min-h-screen bg-white py-12 px-6">
      <div>
        {/* Header */}
        <div className="mb-10 border-b border-gray-200 pb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Text Insights</h1>
          <p className="mt-1 text-sm text-gray-600">
            AI-generated summaries and representative quotes from <span className="font-medium">{surveyData.fileName}</span>
          </p>
        </div>

        {/* Overall Sentiment Overview - Single Card */}
        {textAnalytics.length > 0 && (
          <Card padding="lg" className="mb-10">
            <h3 className="mb-4 text-sm font-medium text-gray-700">Overall Sentiment Analysis</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-600">Sentiment</p>
                <div className="mt-1 flex items-center gap-2">
                  {getSentimentIcon(textAnalytics[0].analytics.overallSentiment.sentiment)}
                  <span className="text-sm font-medium capitalize text-gray-900">
                    {textAnalytics[0].analytics.overallSentiment.sentiment}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Responses</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {textAnalytics[0].analytics.totalResponses}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Text Analysis for each question */}
        <div className="space-y-10">
          {textAnalytics.map((item, index) => (
            <div key={index}>
              {/* Question Title */}
              <h2 className="mb-4 text-base font-medium text-gray-900">
                {item.columnName}
              </h2>

              {/* AI Summary */}
              <Card padding="lg" className="mb-4">
                <h3 className="mb-3 text-sm font-medium text-gray-700">AI Summary</h3>

                {!item.aiSummary && isGeneratingAI ? (
                  <div className="flex items-center gap-3 py-4">
                    <LoadingSpinner size="sm" />
                    <p className="text-sm text-gray-600">Generating AI analysis...</p>
                  </div>
                ) : item.aiSummary ? (
                  <div>
                    <p className="mb-4 text-sm leading-relaxed text-gray-700">
                      {item.aiSummary.summary}
                    </p>

                    {/* Key Themes */}
                    {item.aiSummary.keyThemes.length > 0 && (
                      <div className="mb-3">
                        <p className="mb-2 text-xs font-medium text-gray-600">Key Themes:</p>
                        <div className="flex flex-wrap gap-2">
                          {item.aiSummary.keyThemes.map((theme, idx) => (
                            <span
                              key={idx}
                              className="rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-xs text-gray-700"
                            >
                              {theme}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Insights */}
                    {item.aiSummary.insights.length > 0 && (
                      <div className="mt-3 rounded-md bg-gray-50 p-3">
                        <p className="mb-2 text-xs font-medium text-gray-700">Key Insights:</p>
                        <ul className="space-y-1 text-sm text-gray-700">
                          {item.aiSummary.insights.map((insight, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="mt-1 text-gray-400">•</span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No AI summary available.</p>
                )}
              </Card>

              {/* Representative Quotes */}
              {item.analytics.representativeQuotes.length > 0 && (
                <Card padding="lg">
                  <h3 className="mb-3 text-sm font-medium text-gray-700">
                    Representative Quotes ({item.analytics.representativeQuotes.length})
                  </h3>
                  <div className="space-y-3">
                    {item.analytics.representativeQuotes.map((quote, idx) => (
                      <div key={idx} className="rounded-md border-l-2 border-gray-300 bg-gray-50 py-2.5 pl-4 pr-3">
                        <p className="text-sm italic text-gray-700">"{quote}"</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
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

