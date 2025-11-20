/**
 * Purpose-Built Survey Analytics Dashboard
 * Clean, simple, focused on survey data visualization
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurveyStore } from '../stores/useSurveyStore';
import { EmptyState, Button } from '../components';
import { calculateFrequencyDistribution } from '../lib/analytics';
import { generateCategoricalPalette } from '../lib/designTokens';
import { FileText, Upload as UploadIcon, Download } from 'lucide-react';
import { useChartExport } from '../hooks/useChartExport';

// Simple Horizontal Bar Component
function HorizontalBar({
  label,
  value,
  maxValue,
  color,
  showLabel = true,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  showLabel?: boolean;
}) {
  const percentage = (value / maxValue) * 100;

  return (
    <div className="flex items-center gap-4 mb-3">
      <div className="w-56 text-sm text-gray-700 text-right flex-shrink-0">
        {label}
      </div>
      <div className="flex-1 flex items-center">
        <div
          className="h-9 rounded-r-md relative transition-all hover:opacity-90"
          style={{
            width: `${Math.max(percentage, 5)}%`,
            background: `linear-gradient(90deg, ${color}dd, ${color})`,
          }}
        >
          {showLabel && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-white">
              {value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Stacked Horizontal Bar Component (for cross-tabs)
function StackedHorizontalBar({
  label,
  segments,
  colors,
}: {
  label: string;
  segments: Array<{ name: string; value: number }>;
  colors: string[];
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="flex items-center gap-4 mb-3">
      <div className="w-56 text-sm text-gray-700 text-right flex-shrink-0">
        {label}
      </div>
      <div className="flex-1 flex h-9">
        {segments.map((seg, idx) => {
          const pct = total > 0 ? (seg.value / total) * 100 : 0;
          if (pct === 0) return null;

          return (
            <div
              key={idx}
              className="relative flex items-center justify-center transition-all hover:opacity-90"
              style={{
                width: `${pct}%`,
                backgroundColor: colors[idx % colors.length],
              }}
            >
              {pct > 5 && (
                <span className="text-xs font-semibold text-white">
                  {pct.toFixed(0)}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SurveyDashboard() {
  const navigate = useNavigate();
  const { surveyData } = useSurveyStore();
  const { exportCSV } = useChartExport();

  const colors = useMemo(() => generateCategoricalPalette(12), []);

  const analyses = useMemo(() => {
    if (!surveyData) return [];

    const results: any[] = [];

    // 1. Role Distribution
    const roles = surveyData.rows.map(r => r.Role).filter(v => v);
    if (roles.length > 0) {
      const freq = calculateFrequencyDistribution(roles);
      results.push({
        title: 'Respondent Role',
        n: roles.length,
        type: 'simple',
        data: freq.map(f => ({ name: String(f.value), value: f.count })),
      });
    }

    // 2. Company Size
    const sizes = surveyData.rows.map(r => r.CompanySize).filter(v => v);
    if (sizes.length > 0) {
      const freq = calculateFrequencyDistribution(sizes);
      const sizeOrder = ['2-49', '50-99', '100-249', '250-499', '500-999', '1000-1999'];
      const sorted = freq.sort((a, b) => sizeOrder.indexOf(String(a.value)) - sizeOrder.indexOf(String(b.value)));
      results.push({
        title: 'Company Size Distribution',
        n: sizes.length,
        type: 'simple',
        data: sorted.map(f => ({ name: String(f.value), value: f.count })),
      });
    }

    // 3. CROSS-TAB: Role × Company Size
    const uniqueRoles = [...new Set(roles)] as string[];
    const uniqueSizes = [...new Set(sizes)] as string[];
    const sizeOrder = ['2-49', '50-99', '100-249', '250-499', '500-999', '1000-1999'];
    const sortedSizes = uniqueSizes.sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));

    if (uniqueRoles.length > 0 && sortedSizes.length > 0) {
      const crossTab = uniqueRoles.map(role => ({
        label: role,
        segments: sortedSizes.map(size => ({
          name: size,
          value: surveyData.rows.filter(r => r.Role === role && r.CompanySize === size).length,
        })),
      }));

      results.push({
        title: 'Role Distribution by Company Size',
        n: surveyData.totalRows,
        type: 'stacked',
        data: crossTab,
        legend: sortedSizes,
      });
    }

    // Process ALL Q1-Q20 columns
    const questionGroups = [
      {
        prefix: 'Q1_',
        title: 'Q1: Which stages of product development are you involved in?',
        labels: { Discover: 'Discover', Plan: 'Plan', Design: 'Design', Develop: 'Develop & Implement', Measure: 'Measure & Optimize' },
      },
      {
        prefix: 'Q2_UseAI_',
        title: 'Q2: At which stages do you use internally developed AI tools?',
        labels: { Discover: 'Discover', Plan: 'Plan', Design: 'Design', Develop: 'Develop & Implement', Measure: 'Measure & Optimize' },
      },
      {
        prefix: 'Q3_',
        title: 'Q3: Discover Phase - Activities using internal AI tools',
        labels: {
          PrimaryResearch: 'Primary research',
          DeskResearch: 'Desk research',
          BehavioralData: 'Behavioral data analysis',
          Brainstorming: 'Brainstorming',
          ConceptDev: 'Early concept development',
          InternalReviews: 'Internal reviews',
        },
      },
    ];

    questionGroups.forEach(group => {
      const data: any[] = [];
      Object.entries(group.labels).forEach(([key, label]) => {
        const colName = group.prefix + key;
        if (surveyData.columns.find(c => c.name === colName)) {
          const count = surveyData.rows.filter(r => r[colName] === 'Yes').length;
          data.push({ name: label, value: count });
        }
      });

      if (data.length > 0) {
        results.push({
          title: group.title,
          n: surveyData.totalRows,
          type: 'simple',
          data,
        });
      }
    });

    // MCP Familiarity
    const mcpVals = surveyData.rows.map(r => r.Q18_MCPFamiliarity).filter(v => v && v !== '');
    if (mcpVals.length > 0) {
      const freq = calculateFrequencyDistribution(mcpVals);
      results.push({
        title: 'Q18: MCP (Model Context Protocol) Familiarity',
        n: mcpVals.length,
        type: 'simple',
        data: freq.map(f => ({ name: String(f.value), value: f.count })),
      });
    }

    return results;
  }, [surveyData, colors]);

  if (!surveyData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="No Survey Data"
          description="Upload a CSV file to begin analysis"
          action={
            <Button onClick={() => navigate('/')}>
              <UploadIcon className="h-4 w-4 mr-2" />
              Upload Data
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto px-8 py-12">

        {/* Minimalist Header */}
        <div className="mb-12 pb-8 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{surveyData.fileName}</h1>
            <p className="text-sm text-gray-500 mt-2">n={surveyData.totalRows} responses</p>
          </div>
          <button
            onClick={() => exportCSV(surveyData.rows, `${surveyData.fileName}.csv`)}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        {/* All Survey Questions */}
        <div className="space-y-12">
          {analyses.map((analysis, idx) => (
            <div key={idx} className="border border-gray-100 rounded-xl p-8 shadow-sm">

              {/* Question Title */}
              <div className="mb-8">
                <h2 className="text-base font-semibold text-gray-900">{analysis.title}</h2>
                <p className="text-sm text-gray-500 mt-1">n={analysis.n}</p>
              </div>

              {/* Simple Horizontal Bars */}
              {analysis.type === 'simple' && (
                <div className="mb-8">
                  {analysis.data.map((item: any, barIdx: number) => (
                    <HorizontalBar
                      key={barIdx}
                      label={item.name}
                      value={item.value}
                      maxValue={Math.max(...analysis.data.map((d: any) => d.value))}
                      color={colors[barIdx % colors.length]}
                    />
                  ))}
                </div>
              )}

              {/* Stacked Bars for Cross-Tabs */}
              {analysis.type === 'stacked' && (
                <>
                  <div className="mb-8">
                    {analysis.data.map((item: any, barIdx: number) => (
                      <StackedHorizontalBar
                        key={barIdx}
                        label={item.label}
                        segments={item.segments}
                        colors={colors}
                      />
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-100">
                    {analysis.legend.map((item: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: colors[i % colors.length] }}
                        />
                        <span className="text-xs text-gray-600">{item}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Data Table */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Data</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Response</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Count</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.type === 'simple' && analysis.data.map((item: any, i: number) => {
                        const pct = (item.value / analysis.n) * 100;
                        return (
                          <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{item.value}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 text-right">{pct.toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Upload New Data
          </button>
          <button
            onClick={() => navigate('/insights')}
            className="px-5 py-2.5 text-sm font-medium text-gray-900 border border-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Text Insights
          </button>
        </div>
      </div>
    </div>
  );
}

export { SurveyDashboard as Dashboard };
