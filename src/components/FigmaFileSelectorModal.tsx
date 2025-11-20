import { useState, useEffect } from 'react';
import { X, Loader2, ExternalLink } from 'lucide-react';
import { useSurveyStore } from '../stores/useSurveyStore';
import { getFigmaFiles, uploadChartToFigma, type FigmaFile } from '../lib/figma/api';
import { Button } from './Button';

interface FigmaFileSelectorModalProps {
  chartBlob: Blob;
  chartTitle: string;
  onClose: () => void;
}

export function FigmaFileSelectorModal({
  chartBlob,
  chartTitle,
  onClose,
}: FigmaFileSelectorModalProps) {
  const { figmaToken } = useSurveyStore();
  const [files, setFiles] = useState<FigmaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileKey, setSelectedFileKey] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    if (!figmaToken) return;

    setIsLoading(true);
    setError('');

    try {
      const figmaFiles = await getFigmaFiles(figmaToken);
      setFiles(figmaFiles);
    } catch (err) {
      setError('Failed to load Figma files. Check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!figmaToken || !selectedFileKey) return;

    setIsUploading(true);
    setError('');

    try {
      const result = await uploadChartToFigma(
        figmaToken,
        selectedFileKey,
        chartBlob,
        chartTitle
      );

      if (result.success) {
        alert(`Chart "${chartTitle}" added to Figma Slides!`);
        onClose();
      } else {
        setError('Failed to upload chart. Please try again.');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">Export to Figma Slides</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="mb-4 text-sm text-gray-600">
            Select a Figma Slides file to add "{chartTitle}"
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : files.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-600">
                No Slides files found. Files with "slide" or "deck" in the name will appear here.
              </p>
            </div>
          ) : (
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {files.map((file) => (
                <button
                  key={file.key}
                  onClick={() => setSelectedFileKey(file.key)}
                  className={`w-full rounded-md border p-3 text-left transition-colors ${
                    selectedFileKey === file.key
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{file.name}</div>
                      <div className="mt-1 text-xs text-gray-500">
                        Last modified: {new Date(file.last_modified).toLocaleDateString()}
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 p-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFileKey || isUploading}
            loading={isUploading}
          >
            Add to Slides
          </Button>
        </div>
      </div>
    </div>
  );
}
