import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, BarChart3, TrendingUp, Users, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import type { Insight } from '../lib/ai/insightDiscovery';
import type { ExecutiveSummary } from '../lib/ai/executiveSummary';
import { Card } from './Card';
import { useChartTheme } from '../hooks/useChartTheme';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { FONT_SIZE_MAP } from '../lib/themes';

interface KeyFindingsProps {
  insights: Insight[];
  executiveSummary: ExecutiveSummary | null;
  isLoading: boolean;
}

export function KeyFindings({ insights, executiveSummary, isLoading }: KeyFindingsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { theme, styles } = useChartTheme();
  const prefersReducedMotion = useReducedMotion();

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'insight':
        return <BarChart3 className="h-4 w-4 text-indigo-600" />;
      case 'correlation':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'segment':
        return <Users className="h-4 w-4 text-purple-600" />;
      case 'surprise':
        return <Lightbulb className="h-4 w-4 text-yellow-600" />;
      default:
        return <Scan className="h-4 w-4" style={{ color: theme.colors.textSecondary }} />;
    }
  };

  const getInsightBackground = (type: Insight['type']) => {
    switch (type) {
      case 'correlation': return 'rgba(59, 130, 246, 0.06)';
      case 'segment': return 'rgba(147, 51, 234, 0.06)';
      case 'surprise': return 'rgba(245, 158, 11, 0.06)';
      default: return undefined;
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence > 0.8) return { label: 'High confidence', color: 'bg-green-100 text-green-800' };
    if (confidence > 0.6) return { label: 'Med confidence', color: 'bg-blue-100 text-blue-800' };
    return { label: 'Low confidence', color: 'bg-gray-100 text-gray-800' };
  };

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

          {/* Insights — merged AI bullets + statistical cards */}
          {(executiveSummary?.keyTakeaways?.length || executiveSummary?.surprisingFindings?.length || insights.length > 0) && (
            <div className="mb-6">
              <h3
                className="mb-3"
                style={{
                  fontFamily: styles.fontFamily,
                  fontSize: styles.labelFontSize,
                  fontWeight: 500,
                  color: theme.colors.textSecondary,
                }}
              >
                Insights
              </h3>

              {/* AI-generated bullets */}
              {(executiveSummary?.keyTakeaways?.length || executiveSummary?.surprisingFindings?.length) ? (
                <ul className="mb-4 space-y-1.5">
                  {executiveSummary!.keyTakeaways.map((takeaway, idx) => (
                    <li
                      key={`takeaway-${idx}`}
                      className="flex items-start gap-2"
                      style={{
                        fontFamily: styles.fontFamily,
                        fontSize: styles.labelFontSize,
                        color: theme.colors.textSecondary,
                      }}
                    >
                      <span className="mt-1" style={{ color: theme.colors.textMuted }}>•</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                  {executiveSummary!.surprisingFindings.map((finding, idx) => (
                    <li
                      key={`surprising-${idx}`}
                      className="flex items-start gap-2"
                      style={{
                        fontFamily: styles.fontFamily,
                        fontSize: styles.labelFontSize,
                        color: theme.colors.textSecondary,
                      }}
                    >
                      <Lightbulb className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-yellow-600" />
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {/* Statistical insight cards */}
              {insights.length > 0 && (
                <div className="space-y-3">
              {insights.map((insight, index) => {
                const badge = getConfidenceBadge(insight.confidence);
                return (
                  <motion.div
                    key={insight.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, delay: index * 0.05 }}
                    whileHover={!prefersReducedMotion ? { y: -1 } : undefined}
                    className="flex items-start gap-3 rounded-md border p-3"
                    style={{
                      borderColor: theme.colors.borderColor,
                      backgroundColor: getInsightBackground(insight.type) || theme.colors.cardBackground,
                    }}
                  >
                    <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          style={{
                            fontFamily: styles.fontFamily,
                            fontSize: styles.labelFontSize,
                            fontWeight: 500,
                            color: theme.colors.textPrimary,
                          }}
                        >
                          {insight.title}
                        </h4>
                        <span
                          className={`rounded-md px-2 py-0.5 ${badge.color}`}
                          style={{
                            fontFamily: styles.fontFamily,
                            fontSize: styles.axisTickFontSize,
                            fontWeight: 500,
                          }}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <p
                        className="mt-1"
                        style={{
                          fontFamily: styles.fontFamily,
                          fontSize: styles.axisTickFontSize,
                          color: theme.colors.textSecondary,
                        }}
                      >
                        {insight.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
            </div>
          )}

          {/* Recommendations */}
          {executiveSummary && executiveSummary.recommendations.length > 0 && (
            <div>
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
                {executiveSummary.recommendations.map((rec, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2"
                    style={{
                      fontFamily: styles.fontFamily,
                      fontSize: styles.labelFontSize,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    <span className="mt-1" style={{ color: theme.colors.textMuted }}>→</span>
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
