import { Zap, Settings2, BookOpen, ArrowLeft } from 'lucide-react';
import { Card, Button } from './index';
import type { CleaningMode, CleaningSettings } from '../types/cleaning';
import { getRecentTemplates } from '../utils/cleaningTemplates';

interface CleaningModeSelectorProps {
  issueCount: number;
  onSelectMode: (mode: CleaningMode) => void;
  onSkip?: () => void;
  onBack?: () => void;
  onLoadTemplate?: (settings: CleaningSettings) => void;
}

export function CleaningModeSelector({ issueCount, onSelectMode, onSkip, onBack, onLoadTemplate }: CleaningModeSelectorProps) {
  const recentTemplates = getRecentTemplates(3);
  return (
    <div className="mt-6">
      <Card padding="lg">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Data Cleaning Options
            </h2>
            <p className="text-sm text-gray-600">
              We detected {issueCount} potential issue{issueCount !== 1 ? 's' : ''} in your data.
              Choose how you'd like to proceed:
            </p>
          </div>

          {/* Recent Templates Quick Access */}
          {recentTemplates.length > 0 && onLoadTemplate && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-900">Recent Templates</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      onLoadTemplate(template.settings);
                      onSelectMode('manual');
                    }}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* AUTO Mode */}
            <button
              onClick={() => onSelectMode('auto')}
              className="group relative flex flex-col items-start rounded-lg border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-gray-900 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-lg bg-gray-100 p-2">
                  <Zap className="h-6 w-6 text-gray-900" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">Auto Clean</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Automatically apply recommended cleaning rules with sensible defaults. Fast and
                efficient.
              </p>
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-gray-400" />
                  <span>Remove duplicates automatically</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-gray-400" />
                  <span>Filter speeders and straight-liners</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-gray-400" />
                  <span>Handle missing data intelligently</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-gray-400" />
                  <span>Clean text and detect outliers</span>
                </div>
              </div>
              <div className="mt-4 text-xs font-medium text-gray-900 group-hover:underline">
                Recommended for most surveys →
              </div>
            </button>

            {/* MANUAL Mode */}
            <button
              onClick={() => onSelectMode('manual')}
              className="group relative flex flex-col items-start rounded-lg border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-gray-900 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-lg bg-gray-100 p-2">
                  <Settings2 className="h-6 w-6 text-gray-900" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">Manual Review</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Review each issue type and choose exactly which cleaning operations to apply.
              </p>
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-gray-400" />
                  <span>Preview all detected issues</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-gray-400" />
                  <span>Adjust thresholds and settings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-gray-400" />
                  <span>Choose which operations to apply</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-gray-400" />
                  <span>See before/after preview</span>
                </div>
              </div>
              <div className="mt-4 text-xs font-medium text-gray-900 group-hover:underline">
                More control and transparency →
              </div>
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                {onBack && (
                  <Button variant="ghost" onClick={onBack} icon={<ArrowLeft className="h-4 w-4" />}>
                    Back
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500 mr-4">
                  Original data will be preserved
                </p>
                {onSkip && (
                  <Button variant="ghost" size="sm" onClick={onSkip}>
                    Skip
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
