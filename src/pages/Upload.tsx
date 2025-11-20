import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload, Button, Card, DataTable, LoadingSpinner } from '../components';
import { processSurveyFile } from '../utils/csvParser';
import { useSurveyStore } from '../stores/useSurveyStore';
import { generateAISummaryWithOpenAI } from '../lib/ai/openai';
import { ArrowRight } from 'lucide-react';

export function Upload() {
  const navigate = useNavigate();
  const { setSurveyData, setError, setAISummary, setIsGeneratingAI } = useSurveyStore();
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

      // Pre-generate AI summaries in the background
      generateAISummariesInBackground(surveyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAISummariesInBackground = async (surveyData: any) => {
    setIsGeneratingAI(true);

    // Get text columns (skip IDs)
    const skipColumns = ['ResponseID', 'response_id', 'id', 'timestamp', 'Timestamp'];
    const textColumns = surveyData.columns.filter((c: any) =>
      c.type === 'text' &&
      !skipColumns.some(skip => c.name.toLowerCase().includes(skip.toLowerCase()))
    );

    // Generate AI summaries for each text column
    for (const column of textColumns) {
      const values = surveyData.rows
        .map((row: any) => String(row[column.name] || ''))
        .filter((v: string) => v.trim() && v.length > 3);

      if (values.length > 0) {
        try {
          const aiSummary = await generateAISummaryWithOpenAI(column.name, values);
          setAISummary(column.name, aiSummary);
        } catch (error) {
          console.error(`Failed to generate AI summary for ${column.name}:`, error);
        }
      }
    }

    setIsGeneratingAI(false);
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white py-16 px-6">
      <div className="mx-auto max-w-4xl">
        {/* Hero Section */}
        <div className="mb-16">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
            Welcome to FigDash!
          </h1>
          <div className="max-w-2xl space-y-2 text-sm text-gray-600">
            <p>Upload your survey data in CSV format to generate comprehensive analytics and insights</p>
            <p>We recommend cleaning and organizing your data before uploading. You won't be able to play with your data once it's in FigDash.</p>
          </div>
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
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    Data Preview
                  </h2>
                  <p className="text-sm text-gray-600">
                    Showing first 10 rows
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Detected Columns
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {previewData.columns.map((col) => (
                      <span
                        key={col.name}
                        className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700"
                      >
                        {col.name}
                        <span className="ml-1.5 text-gray-500">
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

      </div>
    </div>
  );
}

