/**
 * HorizontalBarChart Component
 * Themed horizontal bar chart with storytelling support
 */

import { useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useChartStorytelling } from '../../hooks/useStorytelling';
import type { ChartTheme } from '../../types/chartTheme';
import type { Annotation, BarEmphasis } from '../../types/storytelling';

// ============ Types ============

export interface HorizontalBarChartData {
  name: string;
  value: number;
}

export interface HorizontalBarChartProps {
  /** Chart data */
  data: HorizontalBarChartData[];
  /** Total sample size for percentage calculations */
  totalN: number;
  /** Column name for storytelling integration */
  columnName: string;
  /** Colors for each bar */
  colors: string[];
  /** Chart theme */
  theme: ChartTheme;
  /** Computed theme styles */
  styles: ReturnType<typeof import('../../lib/themes').computeThemeStyles>;
  /** Enable storytelling annotations and emphasis */
  enableStorytelling?: boolean;
}

// ============ Single Bar Component ============

interface HorizontalBarProps {
  label: string;
  value: number;
  maxValue: number;
  totalN: number;
  color: string;
  showLabel?: boolean;
  showAxis?: boolean;
  theme: ChartTheme;
  styles: ReturnType<typeof import('../../lib/themes').computeThemeStyles>;
  annotation?: Annotation;
  emphasis?: BarEmphasis;
  onAnnotationUpdate?: (text: string) => void;
  onAnnotationRemove?: () => void;
}

function HorizontalBar({
  label,
  value,
  maxValue,
  totalN,
  color,
  showLabel = true,
  showAxis = false,
  theme,
  styles,
  annotation,
  emphasis,
  onAnnotationRemove,
}: HorizontalBarProps) {
  const percentage = (value / maxValue) * 100;
  const percentOfTotal = (value / totalN) * 100;

  const getAxisLabels = () => {
    const divisions = theme.grid.axisDivisions;
    const labels = [];
    for (let i = 0; i <= divisions; i++) {
      labels.push(Math.round(maxValue * (i / divisions)));
    }
    return labels;
  };

  return (
    <>
      {showAxis && theme.grid.showAxisTicks && (
        <div
          className="flex items-center gap-4"
          style={{ marginBottom: theme.layout.barGap }}
          data-chart-axis
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
            {getAxisLabels().map((val, i) => (
              <span key={i}>{val}</span>
            ))}
          </div>
        </div>
      )}

      {/* Storytelling Annotation - ABOVE the bar */}
      {annotation && annotation.isVisible && (
        <div className="flex items-center gap-4" style={{ marginBottom: '4px' }}>
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
              <span>{annotation.text}</span>
              {onAnnotationRemove && (
                <button
                  onClick={() => onAnnotationRemove()}
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

      <div
        className="flex items-center gap-4 group"
        style={{
          marginBottom: theme.layout.barGap,
          ...(emphasis
            ? {
                backgroundColor: '#f59e0b15',
                marginLeft: '-8px',
                marginRight: '-8px',
                paddingLeft: '8px',
                paddingRight: '8px',
                borderRadius: '4px',
              }
            : {}),
        }}
      >
        <div
          className="text-right flex-shrink-0"
          style={{
            width: theme.layout.labelWidth,
            fontFamily: styles.fontFamily,
            fontSize: styles.labelFontSize,
            fontWeight: emphasis ? 600 : theme.typography.labelWeight,
            color: emphasis ? theme.colors.textPrimary : theme.colors.textSecondary,
          }}
        >
          {label}
        </div>
        <div className="flex-1 flex items-center relative">
          {/* Vertical Grid Lines */}
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
                    borderStyle: styles.gridBorderStyle,
                  }}
                />
              ))}
            </div>
          )}
          <div
            className="relative"
            style={{
              width: `${Math.max(percentage, 3)}%`,
              height: theme.layout.barHeight,
              background: styles.getBarGradient(color),
              borderRadius: `0 ${styles.barBorderRadius} ${styles.barBorderRadius} 0`,
              borderWidth: theme.shapes.barBorderWidth > 0 ? theme.shapes.barBorderWidth : undefined,
              borderColor: theme.shapes.barBorderWidth > 0 ? theme.shapes.barBorderColor : undefined,
              borderStyle: theme.shapes.barBorderWidth > 0 ? 'solid' : undefined,
              cursor: theme.effects.hoverCursor ? 'pointer' : 'default',
              transition: styles.animationTransition,
              ...(emphasis ? { boxShadow: '0 0 0 3px #f59e0b' } : {}),
            }}
            onMouseEnter={(e) => {
              if (theme.effects.hoverOpacity < 1) {
                e.currentTarget.style.opacity = String(theme.effects.hoverOpacity);
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {theme.dataLabels.showBarValues && showLabel && theme.dataLabels.valuePosition === 'inside' && (
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{
                  fontFamily: styles.fontFamily,
                  fontSize: styles.valueFontSize,
                  fontWeight: theme.typography.valueWeight,
                  color: theme.colors.valueLabelColor,
                }}
              >
                {theme.dataLabels.numberFormat === 'percentage'
                  ? `${percentOfTotal.toFixed(theme.dataLabels.percentageDecimals)}%`
                  : value}
              </span>
            )}
          </div>

          {/* Value label outside bar */}
          {theme.dataLabels.showBarValues && showLabel && theme.dataLabels.valuePosition !== 'inside' && (
            <span
              className="ml-2"
              style={{
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
    </>
  );
}

// ============ Main Chart Component ============

export function HorizontalBarChart({
  data,
  totalN,
  columnName,
  colors,
  theme,
  styles,
  enableStorytelling = false,
}: HorizontalBarChartProps) {
  const {
    analyzeChart,
    getAnnotationsForBar,
    getEmphasisForBar,
    updateAnnotationText,
    removeAnnotation,
  } = useChartStorytelling(columnName);

  // Trigger pattern detection when storytelling is enabled
  useEffect(() => {
    if (enableStorytelling) {
      analyzeChart(data, totalN);
    }
  }, [enableStorytelling, data, totalN, analyzeChart]);

  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="w-full">
      {data.map((item, idx) => {
        const annotations = enableStorytelling ? getAnnotationsForBar(item.name) : [];
        const emphasis = enableStorytelling ? getEmphasisForBar(item.name) : undefined;
        const annotation = annotations[0];

        return (
          <HorizontalBar
            key={idx}
            label={item.name}
            value={item.value}
            maxValue={maxValue}
            totalN={totalN}
            color={colors[idx] || colors[0]}
            showAxis={idx === 0}
            theme={theme}
            styles={styles}
            annotation={annotation}
            emphasis={emphasis}
            onAnnotationUpdate={annotation ? (text) => updateAnnotationText(annotation.id, text) : undefined}
            onAnnotationRemove={annotation ? () => removeAnnotation(annotation.id) : undefined}
          />
        );
      })}
    </div>
  );
}
