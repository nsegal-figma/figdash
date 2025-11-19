import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload, Button, Card, DataTable, LoadingSpinner } from '../components';
import { processSurveyFile } from '../utils/csvParser';
import { useSurveyStore } from '../stores/useSurveyStore';
import { ArrowRight, FileText } from 'lucide-react';

export function Upload() {
  const navigate = useNavigate();
  const { setSurveyData, setError } = useSurveyStore();
  const [previewData, setPreviewData] = useState<{
    columns: any[];
    rows: any[];
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setPreviewData(null);

    try {
      const surveyData = await processSurveyFile(file);
      setSurveyData(surveyData);
      setPreviewData({
        columns: surveyData.columns,
        rows: surveyData.rows.slice(0, 10),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-100 rounded-xl">
              <FileText className="h-8 w-8 text-primary-500" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Survey Analytics Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your survey data in CSV format to get comprehensive analytics,
            visualizations, and insights powered by advanced statistics and AI.
          </p>
        </div>

        {/* Upload Section */}
        <div className="max-w-3xl mx-auto">
          <Card padding="lg">
            <FileUpload onFileSelect={handleFileSelect} maxSize={10} />
          </Card>

          {/* Loading State */}
          {isProcessing && (
            <div className="mt-8 flex flex-col items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">Processing your survey data...</p>
            </div>
          )}

          {/* Preview Section */}
          {previewData && !isProcessing && (
            <div className="mt-8">
              <Card padding="lg">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Data Preview
                  </h2>
                  <p className="text-sm text-gray-600">
                    Showing first 10 rows of {previewData.rows.length} total responses
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Detected Columns
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {previewData.columns.map((col) => (
                      <span
                        key={col.name}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-50 text-primary-700"
                      >
                        {col.name}
                        <span className="ml-2 text-xs text-primary-500">
                          ({col.type})
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                <DataTable
                  columns={previewData.columns}
                  data={previewData.rows}
                  maxRows={10}
                />

                <div className="mt-6 flex justify-end">
                  <Button
                    size="lg"
                    icon={<ArrowRight className="h-5 w-5" />}
                    onClick={handleContinue}
                  >
                    Continue to Dashboard
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Features Section */}
        {!previewData && !isProcessing && (
          <div className="mt-16 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              What You'll Get
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card padding="lg" hover>
                <div className="text-primary-500 mb-4">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Comprehensive Statistics
                </h3>
                <p className="text-sm text-gray-600">
                  Get detailed descriptive and inferential statistics including means, medians, correlations, and significance tests.
                </p>
              </Card>

              <Card padding="lg" hover>
                <div className="text-success mb-4">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sentiment Analysis
                </h3>
                <p className="text-sm text-gray-600">
                  Automatically analyze open-ended responses for sentiment, themes, and common keywords.
                </p>
              </Card>

              <Card padding="lg" hover>
                <div className="text-warning mb-4">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Beautiful Visualizations
                </h3>
                <p className="text-sm text-gray-600">
                  Interactive charts and graphs that make your data easy to understand and share.
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

