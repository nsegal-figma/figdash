/**
 * BarAnnotation Component
 * Renders an annotation near a bar with editable capability
 */

import { useState, useRef, useEffect } from 'react';
import { Edit2, X, Check } from 'lucide-react';
import type { Annotation, AnnotationPosition } from '../../types/storytelling';
import { useChartTheme } from '../../hooks/useChartTheme';

interface BarAnnotationProps {
  annotation: Annotation;
  onUpdate: (text: string) => void;
  onRemove: () => void;
}

export function BarAnnotation({ annotation, onUpdate, onRemove }: BarAnnotationProps) {
  const { theme, styles } = useChartTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(annotation.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Reset edit text when annotation changes
  useEffect(() => {
    setEditText(annotation.text);
  }, [annotation.text]);

  if (!annotation.isVisible) return null;

  const handleSave = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== annotation.text) {
      onUpdate(trimmed);
    } else {
      setEditText(annotation.text);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditText(annotation.text);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(annotation.text);
    setIsEditing(false);
  };

  // Position styles based on annotation.position
  const getPositionStyles = (): React.CSSProperties => {
    switch (annotation.position) {
      case 'above':
        return {
          position: 'absolute',
          bottom: '100%',
          left: 0,
          marginBottom: '4px',
        };
      case 'below':
        return {
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '4px',
        };
      case 'right':
        return {
          position: 'absolute',
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginLeft: '8px',
        };
      case 'inline':
        return {
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
        };
      default:
        return {};
    }
  };

  return (
    <div
      className="group/annotation z-10 flex items-center gap-1 whitespace-nowrap"
      style={{
        ...getPositionStyles(),
        fontFamily: styles.fontFamily,
        fontSize: styles.axisTickFontSize,
      }}
    >
      {isEditing ? (
        <div className="flex items-center gap-1 rounded-md border p-0.5 shadow-sm"
          style={{
            borderColor: theme.colors.borderColor,
            backgroundColor: theme.colors.cardBackground,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="rounded border-none bg-transparent px-1.5 py-0.5 outline-none"
            style={{
              fontSize: styles.axisTickFontSize,
              color: theme.colors.textPrimary,
              minWidth: '100px',
              maxWidth: '200px',
            }}
          />
          <button
            onClick={handleSave}
            className="rounded p-0.5 hover:opacity-70"
            style={{ color: theme.colors.textSecondary }}
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            onClick={handleCancel}
            className="rounded p-0.5 hover:opacity-70"
            style={{ color: theme.colors.textMuted }}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <>
          <span
            className="cursor-pointer rounded-sm px-1.5 py-0.5 transition-colors"
            style={{
              backgroundColor: `${theme.colors.textPrimary}15`,
              color: theme.colors.textSecondary,
              fontWeight: 500,
              border: `1px solid ${theme.colors.textPrimary}20`,
            }}
            onClick={() => setIsEditing(true)}
            title="Click to edit"
          >
            {annotation.text}
          </span>
          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/annotation:opacity-100">
            <button
              onClick={() => setIsEditing(true)}
              className="rounded p-0.5 hover:opacity-70"
              style={{ color: theme.colors.textMuted }}
              title="Edit annotation"
            >
              <Edit2 className="h-3 w-3" />
            </button>
            <button
              onClick={onRemove}
              className="rounded p-0.5 hover:opacity-70"
              style={{ color: theme.colors.textMuted }}
              title="Remove annotation"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Simplified annotation display (non-editable)
 */
interface SimpleAnnotationProps {
  text: string;
  position?: AnnotationPosition;
}

export function SimpleAnnotation({ text, position = 'right' }: SimpleAnnotationProps) {
  const { theme, styles } = useChartTheme();

  const getPositionStyles = (): React.CSSProperties => {
    switch (position) {
      case 'above':
        return { bottom: '100%', left: 0, marginBottom: '4px' };
      case 'below':
        return { top: '100%', left: 0, marginTop: '4px' };
      case 'right':
        return { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '8px' };
      case 'inline':
        return { right: '8px', top: '50%', transform: 'translateY(-50%)' };
      default:
        return {};
    }
  };

  return (
    <span
      className="absolute z-10 whitespace-nowrap rounded-sm px-1.5 py-0.5"
      style={{
        ...getPositionStyles(),
        fontFamily: styles.fontFamily,
        fontSize: styles.axisTickFontSize,
        backgroundColor: `${theme.colors.textPrimary}15`,
        color: theme.colors.textSecondary,
        fontWeight: 500,
        border: `1px solid ${theme.colors.textPrimary}20`,
      }}
    >
      {text}
    </span>
  );
}
