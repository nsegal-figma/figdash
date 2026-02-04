/**
 * ThemeEditorButton
 * Button that opens the theme editor slide-out panel
 */

import { Palette } from 'lucide-react';
import { useThemeStore } from '../../stores/useThemeStore';
import { useChartTheme } from '../../hooks/useChartTheme';

export function ThemeEditorButton() {
  const { openEditor } = useThemeStore();
  const { theme, styles } = useChartTheme();

  return (
    <button
      onClick={openEditor}
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
      <Palette className="h-4 w-4" />
      Theme
    </button>
  );
}
