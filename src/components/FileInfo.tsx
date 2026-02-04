import { FileText, X } from 'lucide-react';

interface FileInfoProps {
  fileName: string;
  fileSize: number;
  onRemove: () => void;
}

export function FileInfo({ fileName, fileSize, onRemove }: FileInfoProps) {
  return (
    <div className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <FileText className="h-4 w-4 text-gray-600" />
        <div>
          <div className="text-sm font-medium text-gray-900">{fileName}</div>
          <div className="text-xs text-gray-500">{(fileSize / 1024).toFixed(2)} KB</div>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="text-gray-400 hover:text-gray-900 transition-colors"
        title="Remove file"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
