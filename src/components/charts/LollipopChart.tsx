/**
 * LollipopChart Component
 * Theme-aware lollipop chart (horizontal with dots) with storytelling support
 */

import { Sparkles, X } from 'lucide-react';
import type { ChartTheme } from '../../types/chartTheme';
import type { StorytellingProps } from './ChartRenderer';

// ============ Types ============

export interface LollipopChartData {
  name: string;
  value: number;
}

export interface LollipopChartProps {
  /** Chart data */
  data: LollipopChartData[];
  /** Total sample size for percentage calculations */
  totalN: number;
  /** Colors for each item */
  colors: string[];
  /** Chart theme */
  theme: ChartTheme;
  /** Computed theme styles */
  styles: ReturnType<typeof import('../../lib/themes').computeThemeStyles>;
  /** Column name for storytelling */
  columnName?: string;
  /** Storytelling props */
  storytelling?: StorytellingProps;
}

// ============ Single Lollipop Item ============

interface LollipopItemProps {
  label: string;
  value: number;
  maxValue: number;
  totalN: number;
  color: string;
  theme: ChartTheme;
  styles: ReturnType<typeof import('../../lib/themes').computeThemeStyles>;
  /** Whether this item has emphasis from storytelling */
  hasEmphasis?: boolean;
  /** Annotation text for this item */
  annotationText?: string;
  /** Callback to dismiss annotation */
  onAnnotationDismiss?: () => void;
}

function LollipopItem({
  label,
  value,
  maxValue,
  totalN,
  color,
  theme,
  styles,
  hasEmphasis,
  annotationText,
  onAnnotationDismiss,
}: LollipopItemProps) {
  const percentage = (value / maxValue) * 100;
  const percentOfTotal = (value / totalN) * 100;

  // Dot size based on bar height - larger when emphasized
  const baseDotSize = Math.max(theme.layout.barHeight * 0.6, 12);
  const dotSize = hasEmphasis ? baseDotSize * 1.3 : baseDotSize;

  return (
    <div style={{ marginBottom: theme.layout.barGap }}>
      {/* Inline Annotation */}
      {annotationText && (
        <div className="flex items-center gap-4 mb-1">
          <div style={{ width: theme.layout.labelWidth }} className="flex-shrink-0" />
          <div className="flex-1">
            <div
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1"
              style={{
                backgroundColor: '#f59e0b',
                color: '#fff',
                fontFamily: styles.fontFamily,
                fontSize: styles.axisTickFontSize,
                fontWeight: 600,
              }}
            >
              <Sparkles className="h-3 w-3" />
              <span>{annotationText}</span>
              {onAnnotationDismiss && (
                <button
                  onClick={onAnnotationDismiss}
                  className="ml-1 hover:opacity-70"
                  title="Dismiss"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 group">
        {/* Label */}
        <div
          className="text-right flex-shrink-0"
          style={{
            width: theme.layout.labelWidth,
            fontFamily: styles.fontFamily,
            fontSize: styles.labelFontSize,
            fontWeight: theme.typography.labelWeight,
            color: theme.colors.textSecondary,
          }}
        >
          {label}
        </div>

        {/* Lollipop line and dot */}
      <div
        className="flex-1 flex items-center relative"
        style={{ height: theme.layout.barHeight }}
      >
        {/* Grid lines */}
        {theme.grid.showVerticalGrid && (
          <div className="absolute inset-0 flex justify-between pointer-events-none">
            {Array.from({ length: theme.grid.axisDivisions + 1 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '1px',
                  height: '100%',
                  backgroundColor: theme.colors.gridColor,
                  opacity: theme.grid.gridOpacity,
                }}
              />
            ))}
          </div>
        )}

        {/* Line */}
        <div
          style={{
            width: `${Math.max(percentage, 1)}%`,
            height: '3px',
            backgroundColor: color,
            opacity: 0.6,
            transition: styles.animationTransition,
          }}
        />

        {/* Dot */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: `calc(${Math.max(percentage, 1)}% - ${dotSize / 2}px)`,
            width: dotSize,
            height: dotSize,
            backgroundColor: color,
            borderRadius: '50%',
            boxShadow: hasEmphasis
              ? `0 0 12px 4px #f59e0b, 0 2px 4px rgba(0,0,0,0.1)`
              : '0 2px 4px rgba(0,0,0,0.1)',
            cursor: theme.effects.hoverCursor ? 'pointer' : 'default',
            transition: styles.animationTransition,
            border: hasEmphasis ? '2px solid #f59e0b' : undefined,
          }}
        />

        {/* Value label */}
        {theme.dataLabels.showBarValues && (
          <span
            className="ml-4"
            style={{
              position: 'absolute',
              left: `calc(${Math.max(percentage, 1)}% + ${dotSize / 2 + 8}px)`,
              fontFamily: styles.fontFamily,
              fontSize: styles.valueFontSize,
              fontWeight: theme.typography.valueWeight,
              color: theme.colors.textPrimary,
            }}
          >
            {theme.dataLabels.numberFormat === 'percentage'
              ? `${percentOfTotal.toFixed(theme.dataLabels.percentageDecimals)}%`
              : value}
          </span>
        )}

        {/* Hover Tooltip */}
        <div
          className="pointer-events-none absolute left-0 top-full z-10 mt-2 hidden rounded-lg bg-gray-900 px-3 py-2 shadow-xl group-hover:block"
          style={{
            fontFamily: styles.fontFamily,
            fontSize: styles.labelFontSize,
            minWidth: '120px',
          }}
        >
          <div className="font-medium text-white">{label}</div>
          <div className="mt-1 text-gray-300">
            {value} ({percentOfTotal.toFixed(1)}%)
          </div>
          <div className="absolute -top-1 left-4 h-2 w-2 rotate-45 bg-gray-900" />
        </div>
        </div>
      </div>
    </div>
  );
}

// ============ Main Chart Component ============

export function LollipopChart({
  data,
  totalN,
  colors,
  theme,
  styles,
  storytelling,
}: LollipopChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="w-full">
      {/* Axis labels */}
      {theme.grid.showAxisTicks && (
        <div
          className="flex items-center gap-4"
          style={{ marginBottom: theme.layout.barGap }}
        >
          <div style={{ width: theme.layout.labelWidth }} className="flex-shrink-0" />
          <div
            className="flex-1 flex justify-between px-1"
            style={{
              fontFamily: styles.fontFamily,
              fontSize: styles.axisTickFontSize,
              color: theme.colors.textMuted,
            }}
          >
            {Array.from({ length: theme.grid.axisDivisions + 1 }).map((_, i) => (
              <span key={i}>{Math.round(maxValue * (i / theme.grid.axisDivisions))}</span>
            ))}
          </div>
        </div>
      )}

      {/* Lollipop items */}
      {data.map((item, idx) => {
        const emphasis = storytelling?.getEmphasisForBar(item.name);
        const annotations = storytelling?.getAnnotationsForBar(item.name);
        const visibleAnnotation = annotations?.find(a => a.isVisible);
        return (
          <LollipopItem
            key={idx}
            label={item.name}
            value={item.value}
            maxValue={maxValue}
            totalN={totalN}
            color={colors[idx] || colors[0]}
            theme={theme}
            styles={styles}
            hasEmphasis={!!emphasis}
            annotationText={visibleAnnotation?.text}
            onAnnotationDismiss={visibleAnnotation ? () => storytelling?.removeAnnotation(visibleAnnotation.id) : undefined}
          />
        );
      })}
    </div>
  );
}
