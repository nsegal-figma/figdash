import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, ChevronDown, ChevronUp } from 'lucide-react';
import type { Insight } from '../lib/ai/insightDiscovery';
import type { ExecutiveSummary } from '../lib/ai/executiveSummary';
import { Card } from './Card';
import { useChartTheme } from '../hooks/useChartTheme';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { FONT_SIZE_MAP } from '../lib/themes';
import { useSurveyStore } from '../stores/useSurveyStore';

interface KeyFindingsProps {
  insights: Insight[];
  executiveSummary: ExecutiveSummary | null;
  isLoading: boolean;
}

export function KeyFindings({ insights, executiveSummary, isLoading }: KeyFindingsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { theme, styles } = useChartTheme();
  const prefersReducedMotion = useReducedMotion();
  const surveyType = useSurveyStore((s) => s.surveyType);

  const hasInsights = insights.length > 0;
  const showRecommendations = surveyType === 'regular' && executiveSummary && executiveSummary.recommendations.length > 0;

  if (insights.length === 0 && !isLoading) return null;

  return (
    <Card padding="lg" className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scan className="h-5 w-5" style={{ color: theme.colors.textPrimary }} />
          <h2
            style={{
              fontFamily: styles.fontFamily,
              fontSize: FONT_SIZE_MAP['lg'],
              fontWeight: 600,
              color: theme.colors.textPrimary,
            }}
          >
            Summary
          </h2>
          {isLoading && (
            <span
              style={{
                fontFamily: styles.fontFamily,
                fontSize: styles.axisTickFontSize,
                color: theme.colors.textMuted,
              }}
            >
              (Analyzing...)
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="hover:opacity-70"
          style={{ color: theme.colors.textMuted }}
        >
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            {/* Overview */}
            {executiveSummary && (
              <div
                className="mb-6 rounded-md p-4"
                style={{ backgroundColor: `${theme.colors.borderColor}40` }}
              >
                <p
                  className="leading-relaxed"
                  style={{
                    fontFamily: styles.fontFamily,
                    fontSize: styles.labelFontSize,
                    color: theme.colors.textSecondary,
                  }}
                >
                  {executiveSummary.overview}
                </p>
              </div>
            )}

            {/* Insight cards */}
            {hasInsights && (
              <div className="grid gap-3 sm:grid-cols-2">
                {insights.map((insight) => (
                  <motion.div
                    key={insight.id}
                    className="rounded-lg border p-4"
                    style={{
                      borderColor: theme.colors.borderColor,
                      backgroundColor: 'transparent',
                    }}
                    whileHover={{ y: -1 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
                  >
                    <p
                      style={{
                        fontFamily: styles.fontFamily,
                        fontSize: styles.labelFontSize,
                        fontWeight: 600,
                        color: theme.colors.textPrimary,
                        marginBottom: '0.25rem',
                      }}
                    >
                      {insight.title}
                    </p>
                    <p
                      style={{
                        fontFamily: styles.fontFamily,
                        fontSize: styles.axisTickFontSize,
                        color: theme.colors.textMuted,
                        lineHeight: 1.4,
                      }}
                    >
                      {insight.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Recommendations — regular surveys only */}
            {showRecommendations && (
              <div className="mt-6">
                <h3
                  className="mb-3"
                  style={{
                    fontFamily: styles.fontFamily,
                    fontSize: styles.labelFontSize,
                    fontWeight: 500,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Recommendations
                </h3>
                <ul className="space-y-1.5">
                  {executiveSummary!.recommendations.map((rec, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2"
                      style={{
                        fontFamily: styles.fontFamily,
                        fontSize: styles.labelFontSize,
                        color: theme.colors.textSecondary,
                      }}
                    >
                      <span className="mt-1" style={{ color: theme.colors.textMuted }}>&rarr;</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
