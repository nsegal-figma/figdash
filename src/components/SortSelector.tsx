import { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { useSurveyStore, type SortOrder } from '../stores/useSurveyStore';
import { useChartTheme } from '../hooks/useChartTheme';

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'original', label: 'Original order' },
  { value: 'most-varied', label: 'Most varied' },
  { value: 'most-consensus', label: 'Most consensus' },
];

export function SortSelector() {
  const { sortOrder, setSortOrder } = useSurveyStore();
  const { theme, styles } = useChartTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const current = SORT_OPTIONS.find(o => o.value === sortOrder)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 rounded-md border px-3 py-2 transition-colors hover:opacity-80"
        style={{
          fontFamily: styles.fontFamily,
          fontSize: styles.labelFontSize,
          fontWeight: 500,
          borderColor: theme.colors.borderColor,
          backgroundColor: theme.colors.cardBackground,
          color: theme.colors.textPrimary,
        }}
      >
        <ArrowUpDown className="h-4 w-4" />
        {current.label}
        <ChevronDown className="h-3 w-3" style={{ opacity: 0.5 }} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1 z-50 min-w-[180px] rounded-md border py-1 shadow-lg"
          style={{
            backgroundColor: theme.colors.cardBackground,
            borderColor: theme.colors.borderColor,
          }}
        >
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setSortOrder(opt.value); setOpen(false); }}
              className="w-full text-left px-3 py-2 transition-colors hover:opacity-80"
              style={{
                fontFamily: styles.fontFamily,
                fontSize: styles.labelFontSize,
                fontWeight: opt.value === sortOrder ? 600 : 400,
                color: opt.value === sortOrder ? theme.colors.textPrimary : theme.colors.textSecondary,
                backgroundColor: opt.value === sortOrder ? `${theme.colors.textMuted}15` : 'transparent',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
