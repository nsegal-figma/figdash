import { useState } from 'react';
import { Sparkles, AlertTriangle, TrendingUp, Users, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import type { Insight } from '../lib/ai/insightDiscovery';
import type { ExecutiveSummary } from '../lib/ai/executiveSummary';
import { Card } from './Card';
import { useChartTheme } from '../hooks/useChartTheme';
import { FONT_SIZE_MAP } from '../lib/themes';

interface KeyFindingsProps {
  insights: Insight[];
  executiveSummary: ExecutiveSummary | null;
  isLoading: boolean;
}

export function KeyFindings({ insights, executiveSummary, isLoading }: KeyFindingsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { theme, styles } = useChartTheme();

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'anomaly':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'correlation':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'segment':
        return <Users className="h-4 w-4 text-purple-600" />;
      case 'surprise':
        return <Lightbulb className="h-4 w-4 text-yellow-600" />;
      default:
        return <Sparkles className="h-4 w-4" style={{ color: theme.colors.textSecondary }} />;
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence > 0.8) return { label: 'High', color: 'bg-green-100 text-green-800' };
    if (confidence > 0.6) return { label: 'Med', color: 'bg-blue-100 text-blue-800' };
    return { label: 'Low', color: 'bg-gray-100 text-gray-800' };
  };

  if (insights.length === 0 && !isLoading) return null;

  return (
    <Card padding="lg" className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" style={{ color: theme.colors.textPrimary }} />
          <h2
            style={{
              fontFamily: styles.fontFamily,
              fontSize: FONT_SIZE_MAP['lg'],
              fontWeight: 600,
              color: theme.colors.textPrimary,
            }}
          >
            Key Findings
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

      {isExpanded && (
        <>
          {/* Executive Summary */}
          {executiveSummary && (
            <div
              className="mb-6 rounded-md p-4"
              style={{ backgroundColor: `${theme.colors.borderColor}40` }}
            >
              <h3
              style={{
                fontFamily: styles.fontFamily,
                fontSize: styles.labelFontSize,
                fontWeight: 500,
                marginBottom: '0.75rem',
                color: theme.colors.textPrimary,
              }}
            >
                Executive Summary
              </h3>
              <p
                className="mb-4 leading-relaxed"
                style={{
                  fontFamily: styles.fontFamily,
                  fontSize: styles.labelFontSize,
                  color: theme.colors.textSecondary,
                }}
              >
                {executiveSummary.overview}
              </p>

              {executiveSummary.keyTakeaways.length > 0 && (
                <div className="mb-4">
                  <h4
                    className="mb-2"
                    style={{
                      fontFamily: styles.fontFamily,
                      fontSize: styles.axisTickFontSize,
                      fontWeight: 500,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    Key Takeaways:
                  </h4>
                  <ul className="space-y-1.5">
                    {executiveSummary.keyTakeaways.map((takeaway, idx) => (
                      <li
                        key={idx}
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
                  </ul>
                </div>
              )}

              {executiveSummary.surprisingFindings.length > 0 && (
                <div className="mb-4">
                  <h4
                    className="mb-2"
                    style={{
                      fontFamily: styles.fontFamily,
                      fontSize: styles.axisTickFontSize,
                      fontWeight: 500,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    Surprising Findings:
                  </h4>
                  <ul className="space-y-1.5">
                    {executiveSummary.surprisingFindings.map((finding, idx) => (
                      <li
                        key={idx}
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
                </div>
              )}

              {executiveSummary.recommendations.length > 0 && (
                <div>
                  <h4
                    className="mb-2"
                    style={{
                      fontFamily: styles.fontFamily,
                      fontSize: styles.axisTickFontSize,
                      fontWeight: 500,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    Recommendations:
                  </h4>
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
            </div>
          )}

          {/* Statistical Insights */}
          {insights.length > 0 && (
            <div className="space-y-3">
              <h3
                style={{
                  fontFamily: styles.fontFamily,
                  fontSize: styles.labelFontSize,
                  fontWeight: 500,
                  color: theme.colors.textSecondary,
                }}
              >
                Statistical Patterns Detected:
              </h3>
              {insights.map((insight) => {
                const badge = getConfidenceBadge(insight.confidence);
                return (
                  <div
                    key={insight.id}
                    className="flex items-start gap-3 rounded-md border p-3 transition-colors hover:opacity-90"
                    style={{
                      borderColor: theme.colors.borderColor,
                      backgroundColor: theme.colors.cardBackground,
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
                      {insight.variables.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {insight.variables.map((variable, idx) => (
                            <span
                              key={idx}
                              className="rounded-md px-2 py-0.5"
                              style={{
                                fontFamily: styles.fontFamily,
                                fontSize: styles.axisTickFontSize,
                                backgroundColor: `${theme.colors.borderColor}60`,
                                color: theme.colors.textSecondary,
                              }}
                            >
                              {variable}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </Card>
  );
}
