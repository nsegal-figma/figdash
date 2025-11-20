import { useState, useRef, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { useSurveyStore } from '../stores/useSurveyStore';

interface EditableChartTitleProps {
  columnName: string;
  originalTitle: string;
}

export function EditableChartTitle({ columnName, originalTitle }: EditableChartTitleProps) {
  const { customTitles, setCustomTitle, clearCustomTitle } = useSurveyStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const customTitle = customTitles.get(columnName);
  const displayTitle = customTitle || originalTitle;
  const hasCustomTitle = !!customTitle;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditValue(displayTitle);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== originalTitle) {
      setCustomTitle(columnName, trimmed);
    } else if (!trimmed || trimmed === originalTitle) {
      clearCustomTitle(columnName);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearCustomTitle(columnName);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-base font-medium text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          style={{ width: `${Math.max(editValue.length * 10, 100)}px` }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group/title">
      <h2
        onClick={handleStartEdit}
        className="cursor-text text-base font-medium text-gray-900 hover:text-gray-700"
        title="Click to edit"
      >
        {displayTitle}
      </h2>
      {hasCustomTitle && (
        <button
          onClick={handleReset}
          className="opacity-0 transition-opacity group-hover/title:opacity-100"
          title="Reset to original title"
        >
          <RotateCcw className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </div>
  );
}
