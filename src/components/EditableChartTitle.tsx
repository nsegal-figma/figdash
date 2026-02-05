import { useState, useRef, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { useSurveyStore } from '../stores/useSurveyStore';
import { useChartTheme } from '../hooks/useChartTheme';

interface EditableChartTitleProps {
  columnName: string;
  originalTitle: string;
}

export function EditableChartTitle({ columnName, originalTitle }: EditableChartTitleProps) {
  const { customTitles, setCustomTitle, clearCustomTitle } = useSurveyStore();
  const { theme, styles } = useChartTheme();
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
          className="rounded-md border px-2 py-1 focus:outline-none focus:ring-1"
          style={{
            width: `${Math.max(editValue.length * 10, 100)}px`,
            fontFamily: styles.fontFamily,
            fontSize: styles.titleFontSize,
            fontWeight: theme.typography.titleWeight,
            backgroundColor: theme.colors.cardBackground,
            borderColor: theme.colors.borderColor,
            color: theme.colors.textPrimary,
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group/title">
      <h2
        onClick={handleStartEdit}
        className="cursor-text hover:opacity-80"
        title="Click to edit"
        style={{
          fontFamily: styles.fontFamily,
          fontSize: styles.titleFontSize,
          fontWeight: theme.typography.titleWeight,
          letterSpacing: 'normal',
          color: theme.colors.textPrimary,
        }}
      >
        {displayTitle}
      </h2>
      {hasCustomTitle && (
        <button
          onClick={handleReset}
          className="opacity-0 transition-opacity group-hover/title:opacity-100"
          title="Reset to original title"
        >
          <RotateCcw className="h-3.5 w-3.5" style={{ color: theme.colors.textMuted }} />
        </button>
      )}
    </div>
  );
}
