import { useState } from 'react';
import { Card, Button, LoadingSpinner } from './index';
import {
  Users,
  Zap,
  TrendingDown,
  AlertTriangle,
  FileQuestion,
  FileText,
  ChevronDown,
  ChevronRight,
  Eye,
  Sparkles,
  BookOpen,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import type { SurveyData } from '../types/survey';
import type { CleaningSettings } from '../types/cleaning';
import {
  detectDuplicates,
  detectSpeeders,
  detectStraightLiners,
  detectOutliers,
  detectMissingData,
  detectTextIssues,
} from '../utils/dataCleaningOperations';
import { getAIRecommendations, type ThresholdRecommendations } from '../lib/ai/cleaningRecommendations';
import { TemplateManager } from './TemplateManager';

interface ManualCleaningPanelProps {
  surveyData: SurveyData;
  settings: CleaningSettings;
  onSettingsChange: (settings: CleaningSettings) => void;
  onApply: () => void;
  onCancel: () => void;
  onSkip?: () => void;
}

export function ManualCleaningPanel({
  surveyData,
  settings,
  onSettingsChange,
  onApply,
  onCancel,
  onSkip,
}: ManualCleaningPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['duplicates', 'speeders', 'straightLiners'])
  );
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<ThresholdRecommendations | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Run detection
  const duplicates = detectDuplicates(surveyData, settings.duplicates);
  const speeders = detectSpeeders(surveyData, settings.speeders);
  const straightLiners = detectStraightLiners(surveyData, settings.straightLiners);
  const outliers = detectOutliers(surveyData, settings.outliers);
  const missingData = detectMissingData(surveyData, settings.missingData);
  const textIssues = detectTextIssues(surveyData, settings.textCleaning);

  const totalIssues =
    duplicates.length +
    speeders.length +
    straightLiners.length +
    outliers.length +
    missingData.length +
    textIssues.length;

  const updateSettings = (update: Partial<CleaningSettings>) => {
    onSettingsChange({ ...settings, ...update });
  };

  const handleGetAIRecommendations = async () => {
    setIsLoadingRecommendations(true);
    try {
      const recommendations = await getAIRecommendations(surveyData);
      setAiRecommendations(recommendations);
    } catch (error) {
      alert('Failed to get AI recommendations. Check your OpenAI API key.');
      console.error(error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleApplyAIRecommendations = () => {
    if (!aiRecommendations) return;

    updateSettings({
      speeders: {
        ...settings.speeders,
        method: 'absolute',
        absoluteThreshold: aiRecommendations.speeders.recommendedThreshold,
      },
      straightLiners: {
        ...settings.straightLiners,
        varianceThreshold: aiRecommendations.straightLiners.recommendedVariance,
      },
      outliers: {
        ...settings.outliers,
        method: aiRecommendations.outliers.recommendedMethod,
        action: aiRecommendations.outliers.recommendedAction,
      },
      missingData: {
        ...settings.missingData,
        strategy: aiRecommendations.missingData.recommendedStrategy as any,
      },
    });

    setAiRecommendations(null);
  };

  const handleLoadTemplate = (templateSettings: CleaningSettings) => {
    onSettingsChange(templateSettings);
    setShowTemplateManager(false);
  };

  return (
    <div className="mt-6">
      <Card padding="lg">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Manual Data Cleaning</h2>
              <p className="text-sm text-gray-600">
                {totalIssues} issue{totalIssues !== 1 ? 's' : ''} detected. Review and select which
                operations to apply.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon={<BookOpen className="h-4 w-4" />}
                onClick={() => setShowTemplateManager(true)}
              >
                Templates
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={isLoadingRecommendations ? <LoadingSpinner size="sm" /> : <Sparkles className="h-4 w-4" />}
                onClick={handleGetAIRecommendations}
                disabled={isLoadingRecommendations}
              >
                AI Recommendations
              </Button>
            </div>
          </div>

          {/* AI Recommendations Display */}
          {aiRecommendations && (
            <div className="rounded-lg border-2 border-gray-900 bg-gray-50 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-gray-900" />
                  <h3 className="text-sm font-medium text-gray-900">AI Recommendations</h3>
                </div>
                <Button size="sm" onClick={handleApplyAIRecommendations}>
                  Apply All
                </Button>
              </div>
              <p className="text-xs text-gray-700">{aiRecommendations.overall}</p>
              <div className="space-y-2 text-xs">
                <div className="rounded-md border border-gray-200 bg-white p-2">
                  <span className="font-medium text-gray-900">Speeders:</span>{' '}
                  {aiRecommendations.speeders.recommendedThreshold}s threshold
                  <div className="text-gray-600 mt-1">{aiRecommendations.speeders.reasoning}</div>
                </div>
                <div className="rounded-md border border-gray-200 bg-white p-2">
                  <span className="font-medium text-gray-900">Straight-liners:</span>{' '}
                  Variance {aiRecommendations.straightLiners.recommendedVariance}
                  <div className="text-gray-600 mt-1">
                    {aiRecommendations.straightLiners.reasoning}
                  </div>
                </div>
                <div className="rounded-md border border-gray-200 bg-white p-2">
                  <span className="font-medium text-gray-900">Outliers:</span>{' '}
                  {aiRecommendations.outliers.recommendedMethod} method,{' '}
                  {aiRecommendations.outliers.recommendedAction}
                  <div className="text-gray-600 mt-1">{aiRecommendations.outliers.reasoning}</div>
                </div>
                <div className="rounded-md border border-gray-200 bg-white p-2">
                  <span className="font-medium text-gray-900">Missing Data:</span>{' '}
                  {aiRecommendations.missingData.recommendedStrategy}
                  <div className="text-gray-600 mt-1">
                    {aiRecommendations.missingData.reasoning}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Issue Sections */}
          <div className="space-y-3">
            {/* Duplicates */}
            <IssueSection
              title="Duplicate Responses"
              count={duplicates.length}
              icon={<Users className="h-4 w-4 text-gray-900" />}
              enabled={settings.duplicates.enabled}
              onToggleEnabled={() =>
                updateSettings({
                  duplicates: { ...settings.duplicates, enabled: !settings.duplicates.enabled },
                })
              }
              isExpanded={expandedSections.has('duplicates')}
              onToggle={() => toggleSection('duplicates')}
            >
              <div className="space-y-3">
                <div className="text-xs text-gray-700">
                  Found {duplicates.length} duplicate group{duplicates.length !== 1 ? 's' : ''}.
                  Duplicates will be identified and only the best response kept.
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Keep strategy:
                  </label>
                  <select
                    value={settings.duplicates.keepStrategy}
                    onChange={(e) =>
                      updateSettings({
                        duplicates: {
                          ...settings.duplicates,
                          keepStrategy: e.target.value as 'first' | 'last' | 'most-complete',
                        },
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="first">Keep first response</option>
                    <option value="last">Keep last response</option>
                    <option value="most-complete">Keep most complete response</option>
                  </select>
                </div>
                {duplicates.length > 0 && (
                  <div className="rounded-md bg-gray-50 p-3 space-y-1">
                    <div className="text-xs font-medium text-gray-700">Preview (first 3 groups):</div>
                    {duplicates.slice(0, 3).map((dup, i) => (
                      <div key={i} className="text-xs text-gray-600">
                        Group {i + 1}: Rows {dup.rowIndices.map((r) => r + 1).join(', ')}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </IssueSection>

            {/* Speeders */}
            <IssueSection
              title="Speeders (Too Fast)"
              count={speeders.length}
              icon={<Zap className="h-4 w-4 text-gray-900" />}
              enabled={settings.speeders.enabled}
              onToggleEnabled={() =>
                updateSettings({
                  speeders: { ...settings.speeders, enabled: !settings.speeders.enabled },
                })
              }
              isExpanded={expandedSections.has('speeders')}
              onToggle={() => toggleSection('speeders')}
            >
              <div className="space-y-3">
                <div className="text-xs text-gray-700">
                  Found {speeders.length} response{speeders.length !== 1 ? 's' : ''} completed
                  unusually quickly. These may indicate low-quality data.
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Detection method:
                  </label>
                  <select
                    value={settings.speeders.method}
                    onChange={(e) =>
                      updateSettings({
                        speeders: {
                          ...settings.speeders,
                          method: e.target.value as 'absolute' | 'percentile' | 'median-multiple',
                        },
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="median-multiple">Median multiple (30% of median)</option>
                    <option value="percentile">Bottom percentile (5%)</option>
                    <option value="absolute">Absolute threshold</option>
                  </select>
                </div>
                {speeders.length > 0 && (
                  <div className="rounded-md bg-gray-50 p-3 space-y-1">
                    <div className="text-xs font-medium text-gray-700">Preview (fastest 3):</div>
                    {speeders.slice(0, 3).map((speeder, i) => (
                      <div key={i} className="text-xs text-gray-600">
                        Row {speeder.rowIndex + 1}: {speeder.completionTime}s (
                        {speeder.percentile.toFixed(1)}th percentile)
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </IssueSection>

            {/* Straight-liners */}
            <IssueSection
              title="Straight-liners (Same Answers)"
              count={straightLiners.length}
              icon={<TrendingDown className="h-4 w-4 text-gray-900" />}
              enabled={settings.straightLiners.enabled}
              onToggleEnabled={() =>
                updateSettings({
                  straightLiners: {
                    ...settings.straightLiners,
                    enabled: !settings.straightLiners.enabled,
                  },
                })
              }
              isExpanded={expandedSections.has('straightLiners')}
              onToggle={() => toggleSection('straightLiners')}
            >
              <div className="space-y-3">
                <div className="text-xs text-gray-700">
                  Found {straightLiners.length} response{straightLiners.length !== 1 ? 's' : ''}{' '}
                  with very low variance across Likert scales (may indicate inattention).
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Variance threshold: {settings.straightLiners.varianceThreshold}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.straightLiners.varianceThreshold}
                    onChange={(e) =>
                      updateSettings({
                        straightLiners: {
                          ...settings.straightLiners,
                          varianceThreshold: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Strict</span>
                    <span>Lenient</span>
                  </div>
                </div>
              </div>
            </IssueSection>

            {/* Outliers */}
            <IssueSection
              title="Statistical Outliers"
              count={outliers.length}
              icon={<AlertTriangle className="h-4 w-4 text-gray-900" />}
              enabled={settings.outliers.enabled}
              onToggleEnabled={() =>
                updateSettings({
                  outliers: { ...settings.outliers, enabled: !settings.outliers.enabled },
                })
              }
              isExpanded={expandedSections.has('outliers')}
              onToggle={() => toggleSection('outliers')}
            >
              <div className="space-y-3">
                <div className="text-xs text-gray-700">
                  Found {outliers.length} outlier value{outliers.length !== 1 ? 's' : ''} in numeric
                  columns.
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Action:</label>
                  <select
                    value={settings.outliers.action}
                    onChange={(e) =>
                      updateSettings({
                        outliers: {
                          ...settings.outliers,
                          action: e.target.value as 'flag' | 'remove' | 'cap',
                        },
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="flag">Flag only (keep values)</option>
                    <option value="cap">Cap to 5th/95th percentiles</option>
                    <option value="remove">Remove rows</option>
                  </select>
                </div>
              </div>
            </IssueSection>

            {/* Missing Data */}
            <IssueSection
              title="Missing Data"
              count={missingData.length}
              icon={<FileQuestion className="h-4 w-4 text-gray-900" />}
              enabled={settings.missingData.enabled}
              onToggleEnabled={() =>
                updateSettings({
                  missingData: {
                    ...settings.missingData,
                    enabled: !settings.missingData.enabled,
                  },
                })
              }
              isExpanded={expandedSections.has('missingData')}
              onToggle={() => toggleSection('missingData')}
            >
              <div className="space-y-3">
                <div className="text-xs text-gray-700">
                  Found {missingData.length} column{missingData.length !== 1 ? 's' : ''} with
                  significant missing data.
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Strategy:</label>
                  <select
                    value={settings.missingData.strategy}
                    onChange={(e) =>
                      updateSettings({
                        missingData: { ...settings.missingData, strategy: e.target.value as any },
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="leave">Leave as-is</option>
                    <option value="impute-mean">Impute with mean</option>
                    <option value="impute-median">Impute with median</option>
                    <option value="impute-mode">Impute with mode</option>
                    <option value="remove">Remove rows</option>
                  </select>
                </div>
                {missingData.length > 0 && (
                  <div className="rounded-md bg-gray-50 p-3 space-y-1">
                    <div className="text-xs font-medium text-gray-700">Affected columns:</div>
                    {missingData.map((md, i) => (
                      <div key={i} className="text-xs text-gray-600">
                        {md.column}: {md.missingCount} missing ({md.percentage.toFixed(1)}%)
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </IssueSection>

            {/* Text Issues */}
            <IssueSection
              title="Text Quality Issues"
              count={textIssues.length}
              icon={<FileText className="h-4 w-4 text-gray-900" />}
              enabled={settings.textCleaning.enabled}
              onToggleEnabled={() =>
                updateSettings({
                  textCleaning: {
                    ...settings.textCleaning,
                    enabled: !settings.textCleaning.enabled,
                  },
                })
              }
              isExpanded={expandedSections.has('textIssues')}
              onToggle={() => toggleSection('textIssues')}
            >
              <div className="space-y-3">
                <div className="text-xs text-gray-700">
                  Found {textIssues.length} text response{textIssues.length !== 1 ? 's' : ''} with
                  quality issues (gibberish, too short, repeated characters).
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.textCleaning.trimWhitespace}
                      onChange={(e) =>
                        updateSettings({
                          textCleaning: {
                            ...settings.textCleaning,
                            trimWhitespace: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-gray-300"
                    />
                    <span className="text-xs text-gray-700">Trim whitespace</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.textCleaning.removeUrls}
                      onChange={(e) =>
                        updateSettings({
                          textCleaning: {
                            ...settings.textCleaning,
                            removeUrls: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-gray-300"
                    />
                    <span className="text-xs text-gray-700">Remove URLs</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.textCleaning.detectGibberish}
                      onChange={(e) =>
                        updateSettings({
                          textCleaning: {
                            ...settings.textCleaning,
                            detectGibberish: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-gray-300"
                    />
                    <span className="text-xs text-gray-700">Detect and flag gibberish</span>
                  </label>
                </div>
              </div>
            </IssueSection>
          </div>

          {/* Summary */}
          <div className="rounded-lg border-2 border-gray-900 bg-gray-50 p-4">
            <div className="text-sm font-medium text-gray-900 mb-2">Cleaning Summary</div>
            <div className="space-y-1 text-xs text-gray-700">
              <div>
                • {duplicates.length} duplicate{duplicates.length !== 1 ? 's' : ''} will be removed
              </div>
              <div>
                • {speeders.length} speeder{speeders.length !== 1 ? 's' : ''} will be removed
              </div>
              <div>
                • {straightLiners.length} straight-liner{straightLiners.length !== 1 ? 's' : ''}{' '}
                will be removed
              </div>
              <div>
                • {outliers.length} outlier{outliers.length !== 1 ? 's' : ''} will be{' '}
                {settings.outliers.action === 'flag'
                  ? 'flagged'
                  : settings.outliers.action === 'cap'
                  ? 'capped'
                  : 'removed'}
              </div>
              <div>
                • Missing data will be handled with strategy: {settings.missingData.strategy}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div>
              <Button variant="ghost" onClick={onCancel} icon={<ArrowLeft className="h-4 w-4" />}>
                Back
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setShowPreview(!showPreview)} icon={<Eye className="h-4 w-4" />}>
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
              {onSkip && (
                <Button variant="secondary" onClick={onSkip} icon={<ArrowRight className="h-4 w-4" />}>
                  Skip
                </Button>
              )}
              <Button onClick={onApply} icon={<ArrowRight className="h-4 w-4" />}>
                Apply Cleanings
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Template Manager Modal */}
      {showTemplateManager && (
        <TemplateManager
          currentSettings={settings}
          onLoadTemplate={handleLoadTemplate}
          onClose={() => setShowTemplateManager(false)}
        />
      )}
    </div>
  );
}

// Helper component
function IssueSection({
  title,
  count,
  icon,
  enabled,
  onToggleEnabled,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  enabled: boolean;
  onToggleEnabled: () => void;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-md border ${
        enabled ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between p-3">
        <button onClick={onToggle} className="flex flex-1 items-center gap-2 text-left">
          {icon}
          <span className="text-sm font-medium text-gray-900">{title}</span>
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-medium ${
              count > 0 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {count}
          </span>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400 ml-auto" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
          )}
        </button>
        <label className="flex items-center gap-2 ml-4">
          <input
            type="checkbox"
            checked={enabled}
            onChange={onToggleEnabled}
            className="rounded border-gray-300"
          />
          <span className="text-xs text-gray-600">Apply</span>
        </label>
      </div>
      {isExpanded && <div className="border-t border-gray-200 p-3">{children}</div>}
    </div>
  );
}
