import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileUpload,
  Button,
  Card,
  DataTable,
  LoadingSpinner,
  DataCleaning,
  CleaningModeSelector,
  CleaningReportDisplay,
  ManualCleaningPanel,
  FileInfo,
  CleaningStepper,
} from '../components';
import {
  processSurveyFile,
  processSurveyFileFromCleaned,
  parseCSVRaw,
  detectDataIssues,
  applyDataCleaning,
  type DataIssues,
} from '../utils/csvParser';
import type { SurveyData } from '../types/survey';
import { useSurveyStore } from '../stores/useSurveyStore';
import { generateAISummaryWithOpenAI } from '../lib/ai/openai';
import { discoverInsights } from '../lib/ai/insightDiscovery';
import { generateExecutiveSummary } from '../lib/ai/executiveSummary';
import { runAutoCleaning } from '../utils/autoCleaningEngine';
import { DEFAULT_CLEANING_SETTINGS, type CleaningMode, type CleaningSettings } from '../types/cleaning';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import type { CleaningStep } from '../components/CleaningStepper';

export function Upload() {
  const navigate = useNavigate();
  const {
    setSurveyData,
    setError,
    setAISummary,
    setIsGeneratingAI,
    setInsights,
    setExecutiveSummary,
    setIsGeneratingInsights,
    clearSurvey,
    setOriginalData,
    setCleaningReport,
    setCleaningSettings,
    setCleaningMode,
    cleaningReport,
  } = useSurveyStore();

  const [previewData, setPreviewData] = useState<{
    columns: any[];
    rows: any[];
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<string[][] | null>(null);
  const [dataIssues, setDataIssues] = useState<DataIssues | null>(null);
  const [showCleaning, setShowCleaning] = useState(false);

  // Advanced cleaning state
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showManualPanel, setShowManualPanel] = useState(false);
  const [currentCleaningSettings, setCurrentCleaningSettings] = useState<CleaningSettings>(
    DEFAULT_CLEANING_SETTINGS
  );
  const [processedSurveyData, setProcessedSurveyData] = useState<SurveyData | null>(null);

  // Step tracking
  const [currentStep, setCurrentStep] = useState<CleaningStep | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<CleaningStep>>(new Set());

  const handleFileSelect = async (file: File) => {
    // Reset all state for new upload
    setIsProcessing(true);
    setError(null);
    setPreviewData(null);
    setCurrentFile(null);
    setRawData(null);
    setDataIssues(null);
    setShowCleaning(false);
    setShowModeSelector(false);
    setShowManualPanel(false);
    setProcessedSurveyData(null);
    setCurrentCleaningSettings(DEFAULT_CLEANING_SETTINGS);
    setCurrentStep(null);
    setCompletedSteps(new Set());

    try {
      // Parse raw data to detect issues
      const raw = await parseCSVRaw(file);
      const issues = detectDataIssues(raw);

      setCurrentFile(file);
      setRawData(raw);
      setDataIssues(issues);

      // Start Step 1: Structural Cleaning
      setCurrentStep('structural');

      // If issues found, show cleaning interface
      if (issues.hasMultipleHeaderRows || issues.hasMetadataColumns) {
        setShowCleaning(true);
        setIsProcessing(false);
      } else {
        // No structural issues, move directly to quality cleaning
        const surveyData = await processSurveyFile(file);
        setProcessedSurveyData(surveyData);
        markStepComplete('structural');
        setCurrentStep('quality');
        setShowModeSelector(true);
        setIsProcessing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
      setIsProcessing(false);
    }
  };

  const markStepComplete = (step: CleaningStep) => {
    setCompletedSteps((prev) => new Set([...prev, step]));
  };

  const handleCleanData = async (headerRowIndex: number, rowsToSkip: number[], columnsToRemove: string[]) => {
    if (!currentFile || !rawData) return;

    setIsProcessing(true);
    setShowCleaning(false);

    try {
      const cleanedData = applyDataCleaning(rawData, headerRowIndex, rowsToSkip, columnsToRemove);
      const surveyData = await processSurveyFileFromCleaned(currentFile, cleanedData);

      // Complete Step 1, move to Step 2
      setProcessedSurveyData(surveyData);
      markStepComplete('structural');
      setCurrentStep('quality');
      setShowModeSelector(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clean data');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleModeSelection = async (mode: CleaningMode) => {
    if (!processedSurveyData) return;

    setCleaningMode(mode);
    setCleaningSettings(currentCleaningSettings);
    setShowModeSelector(false);

    if (mode === 'auto') {
      // Run auto-cleaning
      await runAdvancedCleaning();
    } else {
      // Show manual panel
      setShowManualPanel(true);
      setIsProcessing(false);
    }
  };

  const runAdvancedCleaning = async () => {
    if (!processedSurveyData) return;

    setIsProcessing(true);

    try {
      // Store original before cleaning
      setOriginalData(processedSurveyData);

      const result = await runAutoCleaning(processedSurveyData, currentCleaningSettings);

      // Store cleaned data and report
      setSurveyData(result.cleanedData);
      setCleaningReport(result.report);
      setCleaningSettings(currentCleaningSettings);

      setPreviewData({
        columns: result.cleanedData.columns,
        rows: result.cleanedData.rows.slice(0, 10),
      });

      // Complete Step 2, move to Step 3
      markStepComplete('quality');
      setCurrentStep('review');

      // Pre-generate AI summaries and insights
      generateAISummariesInBackground(result.cleanedData);
      generateInsightsInBackground(result.cleanedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Advanced cleaning failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualApply = async () => {
    await runAdvancedCleaning();
    setShowManualPanel(false);
  };

  const handleManualCancel = () => {
    setShowManualPanel(false);
    setShowModeSelector(true);
  };

  const handleBackToStructural = () => {
    // Go back from quality to structural
    setShowModeSelector(false);
    setShowManualPanel(false);
    setShowCleaning(true);
    setCurrentStep('structural');
  };

  const handleBackToQuality = () => {
    // Go back from review to quality
    setPreviewData(null);
    setCleaningReport(null);
    setShowModeSelector(true);
    setCurrentStep('quality');
  };

  const handleSkipAdvancedCleaning = async () => {
    if (!processedSurveyData) return;

    // Skip advanced cleaning, use processed data as-is
    setShowModeSelector(false);
    setShowManualPanel(false);
    setSurveyData(processedSurveyData);
    setPreviewData({
      columns: processedSurveyData.columns,
      rows: processedSurveyData.rows.slice(0, 10),
    });

    // Complete Step 2 (skipped), move to Step 3
    markStepComplete('quality');
    setCurrentStep('review');

    // Pre-generate AI summaries and insights
    generateAISummariesInBackground(processedSurveyData);
    generateInsightsInBackground(processedSurveyData);
  };

  const handleSkipCleaning = async () => {
    if (!currentFile) return;
    // Keep cleaning available but hidden, don't clear the state
    setShowCleaning(false);
    await processFile(currentFile);
  };

  const handleShowCleaningAgain = () => {
    // Clear preview and show cleaning interface again
    setPreviewData(null);
    clearSurvey();
    setShowCleaning(true);
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);

    try {
      const surveyData = await processSurveyFile(file);
      setSurveyData(surveyData);
      setPreviewData({
        columns: surveyData.columns,
        rows: surveyData.rows.slice(0, 10),
      });

      // Pre-generate AI summaries and insights in the background
      generateAISummariesInBackground(surveyData);
      generateInsightsInBackground(surveyData);
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

  const generateInsightsInBackground = async (surveyData: any) => {
    setIsGeneratingInsights(true);

    try {
      // Step 1: Run statistical analysis to discover patterns
      const discoveredInsights = discoverInsights(surveyData);
      setInsights(discoveredInsights);

      // Step 2: Generate AI executive summary based on insights
      const summary = await generateExecutiveSummary(surveyData, discoveredInsights);
      setExecutiveSummary(summary);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleFileRemove = () => {
    // Clear all state when file is removed
    setPreviewData(null);
    setCurrentFile(null);
    setRawData(null);
    setDataIssues(null);
    setShowCleaning(false);
    setShowModeSelector(false);
    setShowManualPanel(false);
    setProcessedSurveyData(null);
    setCurrentCleaningSettings(DEFAULT_CLEANING_SETTINGS);
    setError(null);
    clearSurvey();
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white py-16 px-6">
      <div>
        {/* Hero Section */}
        <div className="mb-16">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
            Welcome to FigDash!
          </h1>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Upload your survey data in CSV format to generate comprehensive analytics and insights</p>
            <p>We recommend cleaning and organizing your data before uploading. You won't be able to play with your data once it's in FigDash.</p>
          </div>
        </div>

        {/* Upload Section */}
        <div>
          {/* Show FileUpload only if no file selected */}
          {!currentFile && (
            <Card padding="lg">
              <FileUpload
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                maxSize={10}
              />
            </Card>
          )}

          {/* Show file info only on structural cleaning step */}
          {currentFile && currentStep === 'structural' && (
            <FileInfo
              fileName={currentFile.name}
              fileSize={currentFile.size}
              onRemove={handleFileRemove}
            />
          )}

          {/* Show stepper when file is uploaded (centered) */}
          {currentFile && currentStep && (
            <div className="flex justify-center my-8">
              <div className="w-full max-w-3xl">
                <CleaningStepper currentStep={currentStep} completedSteps={completedSteps} />
              </div>
            </div>
          )}

          {/* Data Cleaning Section */}
          {showCleaning && rawData && dataIssues && (
            <DataCleaning
              rawData={rawData}
              issues={dataIssues}
              onClean={handleCleanData}
              onSkip={handleSkipCleaning}
            />
          )}

          {/* Advanced Cleaning Mode Selector */}
          {showModeSelector && processedSurveyData && (
            <CleaningModeSelector
              issueCount={6}
              onSelectMode={handleModeSelection}
              onSkip={handleSkipAdvancedCleaning}
              onBack={handleBackToStructural}
              onLoadTemplate={(settings) => setCurrentCleaningSettings(settings)}
            />
          )}

          {/* Manual Cleaning Panel */}
          {showManualPanel && processedSurveyData && (
            <ManualCleaningPanel
              surveyData={processedSurveyData}
              settings={currentCleaningSettings}
              onSettingsChange={setCurrentCleaningSettings}
              onApply={handleManualApply}
              onCancel={handleManualCancel}
              onSkip={handleSkipAdvancedCleaning}
            />
          )}

          {/* Loading State */}
          {isProcessing && (
            <div className="mt-8 flex flex-col items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">Processing your survey data...</p>
            </div>
          )}

          {/* Cleaning Report */}
          {cleaningReport && !isProcessing && currentFile && (
            <div className="mt-8">
              <CleaningReportDisplay report={cleaningReport} fileName={currentFile.name} />
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
                    Showing first 10 rows • {previewData.columns.length} columns
                  </p>
                </div>

                <DataTable
                  columns={previewData.columns}
                  data={previewData.rows}
                  maxRows={10}
                />

                <div className="mt-6 flex justify-between items-center">
                  <div>
                    {currentStep === 'review' && (
                      <Button variant="ghost" onClick={handleBackToQuality} icon={<ArrowLeft className="h-4 w-4" />}>
                        Back
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {/* Show "Clean Data" button if issues were detected but skipped */}
                    {dataIssues && (dataIssues.hasMultipleHeaderRows || dataIssues.hasMetadataColumns) && (
                      <Button
                        variant="secondary"
                        onClick={handleShowCleaningAgain}
                      >
                        Re-clean Structural Issues
                      </Button>
                    )}
                    <Button
                      size="lg"
                      icon={<ArrowRight className="h-5 w-5" />}
                      onClick={handleContinue}
                    >
                      Continue to Dashboard
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

