import React, { useCallback, useState, useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  accept = '.csv',
  maxSize = 10,
  className = '',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError('');
    
    // Check file type
    if (accept && !file.name.endsWith(accept.replace('*', ''))) {
      setError(`Please upload a ${accept} file`);
      return false;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`File size must be less than ${maxSize}MB`);
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError('');
    // Reset the file input so the same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileRemove?.();
  };

  return (
    <div className={className}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : error
            ? 'border-error bg-error-light'
            : selectedFile
            ? 'border-success bg-success-light'
            : 'border-gray-300 hover:border-primary-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className={`absolute inset-0 w-full h-full opacity-0 ${
            selectedFile ? 'pointer-events-none' : 'cursor-pointer'
          }`}
          id="file-upload"
        />

        <AnimatePresence mode="wait">
          {selectedFile ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10 flex flex-col items-center pointer-events-auto"
            >
              <FileText className="h-12 w-12 text-success mb-3" />
              <p className="text-sm font-medium text-gray-900 mb-1">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-600 mb-4">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  clearFile();
                }}
                className="relative z-10 inline-flex items-center gap-1 text-sm text-error hover:text-error-dark pointer-events-auto"
              >
                <X className="h-4 w-4" />
                Remove
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Upload
                className={`h-12 w-12 mx-auto mb-3 ${
                  isDragging ? 'text-primary-500' : 'text-gray-400'
                }`}
              />
              <p className="text-sm font-medium text-gray-900 mb-1">
                {isDragging ? 'Drop your file here' : 'Drop your CSV file here'}
              </p>
              <p className="text-xs text-gray-600 mb-4">
                or click to browse (max {maxSize}MB)
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-error"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}






