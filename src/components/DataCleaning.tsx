import { useState, useEffect } from 'react';
import { Card, Button } from './index';
import { AlertCircle, CheckCircle, ChevronDown, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';
import type { DataIssues } from '../utils/csvParser';

interface DataCleaningProps {
  rawData: string[][];
  issues: DataIssues;
  onClean: (headerRowIndex: number, rowsToSkip: number[], columnsToRemove: string[]) => void;
  onSkip: () => void;
  onBack?: () => void;
}

// Metadata detection patterns - flexible to handle spaces and variations
const METADATA_PATTERNS = [
  /^(start|end)\s*date$/i,
  /^start\s*time$/i,
  /^end\s*time$/i,
  /^status$/i,
  /^ip\s*address$/i,
  /^ip$/i,
  /^progress$/i,
  /^duration/i,
  /^finished$/i,
  /^recorded\s*date$/i,
  /^response\s*id$/i,
  /^response\s*type$/i,
  /^recipient/i,
  /^external.*reference$/i,
  /^location\s*latitude$/i,
  /^location\s*longitude$/i,
  /^latitude$/i,
  /^longitude$/i,
  /^distribution\s*channel$/i,
  /^user\s*language$/i,
  /^language$/i,
  /^nx$/i,
  /^red_(completed|screened|quota)$/i,
  /^q_terminateflag$/i,
  /^change$/i,
  /^screened$/i,
  /^_recordid$/i,
  /^row$/i,
  /^row\s*number$/i,
];

// Helper function to detect metadata columns
function detectMetadataColumns(headers: string[]): string[] {
  return headers.filter((header) =>
    METADATA_PATTERNS.some((pattern) => pattern.test(header.trim()))
  );
}

export function DataCleaning({ rawData, issues, onClean, onSkip, onBack }: DataCleaningProps) {
  const [headerRowIndex, setHeaderRowIndex] = useState(issues.suggestedHeaderRowIndex);
  const [rowsToSkip, setRowsToSkip] = useState<Set<number>>(new Set(issues.suggestedRowsToSkip));
  const [columnsToRemove, setColumnsToRemove] = useState<Set<string>>(new Set());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewMode, setPreviewMode] = useState<'before' | 'after'>('before');

  // Get headers based on current settings
  const currentHeaders = rawData[headerRowIndex] || rawData[0];
  const previewHeaders = currentHeaders;

  // Detect ALL metadata columns from current header row (deduplicate with Set)
  const allMetadataColumns = Array.from(new Set(detectMetadataColumns(currentHeaders)));

  // Detect and set metadata columns ONLY when header row changes (not on every render)
  useEffect(() => {
    const detectedMetadata = Array.from(new Set(detectMetadataColumns(rawData[headerRowIndex] || rawData[0])));
    setColumnsToRemove(new Set(detectedMetadata));
  }, [headerRowIndex]);

  const hasIssues = issues.hasMultipleHeaderRows || issues.hasMetadataColumns;

  const handleRemoveAllMetadata = () => {
    setColumnsToRemove(new Set(allMetadataColumns));
  };

  const handleKeepAllMetadata = () => {
    setColumnsToRemove(new Set());
  };

  // Get preview data rows
  const getPreviewData = () => {
    if (previewMode === 'before') {
      return rawData.slice(0, Math.min(10, rawData.length));
    }

    // After cleaning - show only non-skipped rows
    const columnIndices: number[] = [];
    currentHeaders.forEach((header, index) => {
      if (!columnsToRemove.has(header)) {
        columnIndices.push(index);
      }
    });

    const result: string[][] = [];

    // Add header row
    result.push(currentHeaders.filter(h => !columnsToRemove.has(h)));

    // Add data rows (skip header row and rows marked to skip)
    let count = 0;
    for (let i = 0; i < rawData.length && count < 5; i++) {
      if (i !== headerRowIndex && !rowsToSkip.has(i)) {
        result.push(columnIndices.map(idx => rawData[i][idx] || ''));
        count++;
      }
    }

    return result;
  };

  const previewData = getPreviewData();

  const toggleRow = (rowIndex: number) => {
    const newSet = new Set(rowsToSkip);
    if (newSet.has(rowIndex)) {
      newSet.delete(rowIndex);
    } else {
      newSet.add(rowIndex);
    }
    setRowsToSkip(newSet);
  };

  const toggleColumn = (column: string) => {
    const newSet = new Set(columnsToRemove);
    if (newSet.has(column)) {
      newSet.delete(column);
    } else {
      newSet.add(column);
    }
    setColumnsToRemove(newSet);
  };

  const handleClean = () => {
    onClean(headerRowIndex, Array.from(rowsToSkip), Array.from(columnsToRemove));
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!hasIssues) {
    return null;
  }

  return (
    <div className="mt-6">
      <Card padding="lg">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Data Issues Detected
              </h2>
              <p className="text-sm text-gray-600">
                We found some issues that might affect your analysis. Review and clean your data below.
              </p>
            </div>
          </div>

          {/* Issues List */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
            {issues.hasMultipleHeaderRows && (
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span className="text-amber-900">
                  <strong>Multiple header rows detected:</strong> {issues.suggestedRowsToSkip.length} rows should be removed
                </span>
              </div>
            )}
            {issues.hasMetadataColumns && (
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span className="text-amber-900">
                  <strong>Metadata columns detected:</strong> {allMetadataColumns.length} columns in selected header row (timestamps, IDs, locations, etc.)
                </span>
              </div>
            )}
          </div>

          {/* Header Row Selection */}
          {issues.hasMultipleHeaderRows && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Which row contains the column headers?
              </label>
              <select
                value={headerRowIndex}
                onChange={(e) => setHeaderRowIndex(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                {rawData.slice(0, Math.min(10, rawData.length)).map((_, idx) => (
                  <option key={idx} value={idx}>
                    Row {idx + 1}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                This row will be used as column headers (shown in blue in the preview below)
              </p>
            </div>
          )}

          {/* Quick Actions for Metadata */}
          {allMetadataColumns.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">
                {allMetadataColumns.length} metadata columns detected:
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRemoveAllMetadata}
                disabled={columnsToRemove.size === allMetadataColumns.length}
              >
                Remove All
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleKeepAllMetadata}
                disabled={columnsToRemove.size === 0}
              >
                Keep All
              </Button>
            </div>
          )}

          {/* Preview Toggle */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Preview</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode('before')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  previewMode === 'before'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Before
              </button>
              <button
                onClick={() => setPreviewMode('after')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  previewMode === 'after'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                After Cleaning
              </button>
            </div>
          </div>

          {/* Data Preview */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {previewMode === 'before' && (
                      <>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                          Skip
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                          Row
                        </th>
                      </>
                    )}
                    {previewHeaders.map((header, i) => {
                      const isRemoved = columnsToRemove.has(header);
                      return (
                        <th
                          key={i}
                          className={`px-3 py-2 text-left text-xs font-medium uppercase tracking-wider ${
                            isRemoved && previewMode === 'before' ? 'bg-red-50 text-red-600' : 'text-gray-500'
                          }`}
                        >
                          <div className="max-w-[200px] truncate" title={header}>
                            {header}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((row, displayRowIndex) => {
                    const actualRowIndex = previewMode === 'before' ? displayRowIndex : -1;
                    const isSkipped = rowsToSkip.has(actualRowIndex);
                    const isHeader = actualRowIndex === headerRowIndex;

                    return (
                      <tr
                        key={displayRowIndex}
                        className={
                          isHeader && previewMode === 'before'
                            ? 'bg-blue-50'
                            : isSkipped && previewMode === 'before'
                            ? 'bg-red-50'
                            : displayRowIndex === 0 && previewMode === 'after'
                            ? 'bg-blue-50'
                            : ''
                        }
                      >
                        {previewMode === 'before' && (
                          <>
                            <td className="px-3 py-2 whitespace-nowrap text-center">
                              <input
                                type="checkbox"
                                checked={isSkipped}
                                onChange={() => toggleRow(actualRowIndex)}
                                disabled={isHeader}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                              />
                            </td>
                            <td className={`px-3 py-2 whitespace-nowrap text-gray-500 font-mono ${
                              isSkipped ? 'text-red-600 font-semibold' : isHeader ? 'text-blue-600 font-semibold' : ''
                            }`}>
                              {actualRowIndex + 1}
                              {isHeader && ' (H)'}
                            </td>
                          </>
                        )}
                        {row.map((cell, cellIndex) => {
                          // Use previewHeaders (which now always equals currentHeaders) for consistent lookup
                          const header = previewHeaders[cellIndex];
                          const isColumnRemoved = columnsToRemove.has(header);

                          return (
                            <td
                              key={cellIndex}
                              className={`px-3 py-2 whitespace-nowrap ${
                                isColumnRemoved && previewMode === 'before'
                                  ? 'bg-red-50 text-red-600'
                                  : 'text-gray-900'
                              }`}
                            >
                              <div className="max-w-[200px] truncate" title={String(cell)}>
                                {cell}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Advanced Options */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              {showAdvanced ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              Advanced Options
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4 pl-6 border-l-2 border-gray-200">
                {/* Columns to Remove - Individual Control */}
                {allMetadataColumns.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Individual column control
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {currentHeaders.map((header, i) => {
                        const isMetadata = allMetadataColumns.includes(header);
                        const isRemoved = columnsToRemove.has(header);
                        return (
                          <button
                            key={i}
                            onClick={() => toggleColumn(header)}
                            className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs transition-colors ${
                              isRemoved
                                ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                                : isMetadata
                                ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <div className="max-w-[150px] truncate" title={header}>
                              {header}
                            </div>
                            {isRemoved && (
                              <span className="ml-1.5 text-red-500">✕</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Click to toggle. Red = will be removed, Amber = metadata detected (suggested for removal)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div>
              {onBack && (
                <Button variant="ghost" onClick={onBack} icon={<ArrowLeft className="h-4 w-4" />}>
                  Back
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={handleSkip} icon={<ArrowRight className="h-4 w-4" />}>
                Skip
              </Button>
              <Button onClick={handleClean} icon={<ArrowRight className="h-4 w-4" />}>
                Clean
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
