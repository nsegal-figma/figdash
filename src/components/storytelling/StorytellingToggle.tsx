/**
 * StorytellingToggle Component
 * Toggle button for enabling/disabling storytelling mode
 */

import { Sparkles } from 'lucide-react';
import { useStorytelling } from '../../hooks/useStorytelling';
import { useChartTheme } from '../../hooks/useChartTheme';

export function StorytellingToggle() {
  const { isEnabled, toggle } = useStorytelling();
  const { theme, styles } = useChartTheme();

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-md border px-3 py-2 transition-all hover:opacity-80"
      style={{
        fontFamily: styles.fontFamily,
        fontSize: styles.labelFontSize,
        fontWeight: 500,
        borderColor: isEnabled ? theme.colors.textPrimary : theme.colors.borderColor,
        backgroundColor: isEnabled ? theme.colors.textPrimary : theme.colors.cardBackground,
        color: isEnabled ? theme.colors.cardBackground : theme.colors.textSecondary,
      }}
      title={isEnabled ? 'Disable insights mode' : 'Enable insights mode'}
    >
      <Sparkles
        className="h-4 w-4"
        style={{
          opacity: isEnabled ? 1 : 0.7,
        }}
      />
      <span>Insights</span>
    </button>
  );
}
