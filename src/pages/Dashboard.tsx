import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurveyStore } from '../stores/useSurveyStore';
import { Card, EmptyState, Button } from '../components';
import { BarChartV2 } from '../components/charts-v2/BarChart';
import { calculateFrequencyDistribution } from '../lib/analytics';
import { generateCategoricalPalette } from '../lib/designTokens';
import { FileText, Upload as UploadIcon, Download } from 'lucide-react';
import { useChartExport } from '../hooks/useChartExport';

export function Dashboard() {
  const navigate = useNavigate();
  const { surveyData } = useSurveyStore();
  const { exportCSV } = useChartExport();

  // Process ALL columns for comprehensive survey analytics
  const visualizations = useMemo(() => {
    if (!surveyData) return [];

    const viz: any[] = [];

    // 1. Demographics: Role distribution
    const roleColumn = surveyData.columns.find(c => c.name === 'Role');
    if (roleColumn) {
      const roleValues = surveyData.rows.map(r => r.Role).filter(v => v);
      const roleFreq = calculateFrequencyDistribution(roleValues);
      viz.push({
        title: 'Respondent Role',
        n: roleValues.length,
        type: 'horizontal-bar',
        data: roleFreq.map(f => ({ name: String(f.value), value: f.count, percentage: f.percentage })),
        tableData: roleFreq.map(f => ({
          Role: f.value,
          Count: f.count,
          Percentage: `${f.percentage.toFixed(1)}%`
        }))
      });
    }

    // 2. Demographics: Company Size distribution
    const sizeColumn = surveyData.columns.find(c => c.name === 'CompanySize');
    if (sizeColumn) {
      const sizeValues = surveyData.rows.map(r => r.CompanySize).filter(v => v);
      const sizeFreq = calculateFrequencyDistribution(sizeValues);
      // Sort by company size order
      const sizeOrder = ['2-49', '50-99', '100-249', '250-499', '500-999', '1000-1999', '2000-4999', '5000-9999', '10000+'];
      const sortedFreq = sizeFreq.sort((a, b) => {
        const aIdx = sizeOrder.indexOf(String(a.value));
        const bIdx = sizeOrder.indexOf(String(b.value));
        return aIdx - bIdx;
      });

      viz.push({
        title: 'Company Size Distribution',
        n: sizeValues.length,
        type: 'horizontal-bar',
        data: sortedFreq.map(f => ({ name: String(f.value), value: f.count, percentage: f.percentage })),
        tableData: sortedFreq.map(f => ({
          'Company Size': f.value,
          Count: f.count,
          Percentage: `${f.percentage.toFixed(1)}%`
        }))
      });
    }

    // 3. CROSS-TAB: Role × Company Size (100% stacked like your screenshots)
    if (roleColumn && sizeColumn) {
      const roles = [...new Set(surveyData.rows.map(r => r.Role).filter(v => v))] as string[];
      const sizes = [...new Set(surveyData.rows.map(r => r.CompanySize).filter(v => v))] as string[];

      const sizeOrder = ['2-49', '50-99', '100-249', '250-499', '500-999', '1000-1999', '2000-4999', '5000-9999', '10000+'];
      const sortedSizes = sizes.sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));

      const crossTabData = roles.map(role => {
        const roleRows = surveyData.rows.filter(r => r.Role === role);
        const total = roleRows.length;

        const result: any = { role };
        sortedSizes.forEach(size => {
          const count = roleRows.filter(r => r.CompanySize === size).length;
          result[size] = total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0;
        });
        return result;
      });

      // Table data with counts and percentages
      const tableData = roles.map(role => {
        const roleRows = surveyData.rows.filter(r => r.Role === role);
        const total = roleRows.length;
        const row: any = { Role: role, 'Total (n)': total };
        sortedSizes.forEach(size => {
          const count = roleRows.filter(r => r.CompanySize === size).length;
          const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
          row[size] = `${count} (${pct}%)`;
        });
        return row;
      });

      viz.push({
        title: 'Role Distribution by Company Size',
        n: surveyData.totalRows,
        type: 'stacked-crosstab',
        data: crossTabData,
        xKey: 'role',
        yKeys: sortedSizes,
        tableData
      });
    }

    // 4. Q1 Stage Involvement
    const stageInvolvementCols = ['Q1_Discover', 'Q1_Plan', 'Q1_Design', 'Q1_Develop', 'Q1_Measure'];
    const stageLabels = ['Discover', 'Plan', 'Design', 'Develop & Implement', 'Measure & Optimize'];

    if (stageInvolvementCols.every(col => surveyData.columns.find(c => c.name === col))) {
      const stageData = stageLabels.map((label, idx) => {
        const colName = stageInvolvementCols[idx];
        const yesCount = surveyData.rows.filter(r => r[colName] === 'Yes').length;
        return {
          name: label,
          value: yesCount,
          percentage: (yesCount / surveyData.totalRows) * 100
        };
      });

      viz.push({
        title: 'Which stages of product development are you involved in?',
        n: surveyData.totalRows,
        type: 'horizontal-bar',
        data: stageData,
        tableData: stageData.map(d => ({
          Stage: d.name,
          Count: d.value,
          Percentage: `${d.percentage.toFixed(1)}%`
        }))
      });
    }

    // 5. Q2: AI Tool Usage by Stage
    const aiUsageCols = ['Q2_UseAI_Discover', 'Q2_UseAI_Plan', 'Q2_UseAI_Design', 'Q2_UseAI_Develop', 'Q2_UseAI_Measure'];

    if (aiUsageCols.every(col => surveyData.columns.find(c => c.name === col))) {
      const aiData = stageLabels.map((label, idx) => {
        const colName = aiUsageCols[idx];
        const yesCount = surveyData.rows.filter(r => r[colName] === 'Yes').length;
        return {
          name: label,
          value: yesCount,
          percentage: (yesCount / surveyData.totalRows) * 100
        };
      });

      viz.push({
        title: 'At which stages do you use internally developed AI tools?',
        n: surveyData.totalRows,
        type: 'horizontal-bar',
        data: aiData,
        tableData: aiData.map(d => ({
          Stage: d.name,
          Count: d.value,
          Percentage: `${d.percentage.toFixed(1)}%`
        }))
      });
    }

    // 6. Q3: Discover Activities
    const discoverActivityCols = [
      'Q3_PrimaryResearch',
      'Q3_DeskResearch',
      'Q3_BehavioralData',
      'Q3_Brainstorming',
      'Q3_ConceptDev',
      'Q3_InternalReviews'
    ];
    const discoverLabels = [
      'Primary research',
      'Desk research',
      'Behavioral data analysis',
      'Brainstorming',
      'Early concept development',
      'Internal reviews'
    ];

    if (discoverActivityCols.every(col => surveyData.columns.find(c => c.name === col))) {
      const discoverData = discoverLabels.map((label, idx) => {
        const colName = discoverActivityCols[idx];
        const yesCount = surveyData.rows.filter(r => r[colName] === 'Yes').length;
        return {
          name: label,
          value: yesCount,
          percentage: (yesCount / surveyData.totalRows) * 100
        };
      });

      viz.push({
        title: 'Discover Phase: Activities Using Internal AI Tools',
        n: surveyData.totalRows,
        type: 'horizontal-bar',
        data: discoverData,
        tableData: discoverData.map(d => ({
          Activity: d.name,
          Count: d.value,
          Percentage: `${d.percentage.toFixed(1)}%`
        }))
      });
    }

    // 7. Q18: MCP Familiarity
    const mcpColumn = surveyData.columns.find(c => c.name === 'Q18_MCPFamiliarity');
    if (mcpColumn) {
      const mcpValues = surveyData.rows.map(r => r.Q18_MCPFamiliarity).filter(v => v && v !== '');
      const mcpFreq = calculateFrequencyDistribution(mcpValues);
      viz.push({
        title: 'MCP (Model Context Protocol) Familiarity Level',
        n: mcpValues.length,
        type: 'horizontal-bar',
        data: mcpFreq.map(f => ({ name: String(f.value), value: f.count, percentage: f.percentage })),
        tableData: mcpFreq.map(f => ({
          'Familiarity Level': f.value,
          Count: f.count,
          Percentage: `${f.percentage.toFixed(1)}%`
        }))
      });
    }

    return viz;
  }, [surveyData]);

  if (!surveyData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <EmptyState
            icon={<FileText className="h-12 w-12" />}
            title="No Survey Data"
            description="Upload a CSV file to get started with analytics and visualizations."
            action={
              <Button onClick={() => navigate('/')} icon={<UploadIcon className="h-5 w-5" />}>
                Upload Data
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with n= */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Survey Analytics Dashboard</h1>
            <p className="text-gray-600">
              <span className="font-medium">{surveyData.fileName}</span> • <span className="font-semibold">n={surveyData.totalRows}</span> responses
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => exportCSV(surveyData.rows, `${surveyData.fileName}-export.csv`)}
            icon={<Download className="h-5 w-5" />}
          >
            Export Data
          </Button>
        </div>

        {/* Visualizations - ALL data */}
        <div className="space-y-8">
          {visualizations.map((viz, index) => (
            <Card key={index} padding="lg">
              {/* Chart Title with n= (like your screenshots) */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {viz.title} <span className="text-gray-500 font-normal text-lg ml-2">{viz.n}</span>
                </h2>
              </div>

              {/* Chart - Each bar gets different color */}
              {viz.type === 'horizontal-bar' && (
                <div className="w-full">
                  {viz.data.map((item: any, barIdx: number) => {
                    const colors = generateCategoricalPalette(Math.min(viz.data.length, 12));
                    return (
                      <div key={barIdx} className="mb-2">
                        <div className="flex items-center gap-4">
                          <div className="w-48 text-sm font-medium text-gray-700 text-right flex-shrink-0">
                            {item.name}
                          </div>
                          <div className="flex-1 flex items-center gap-3">
                            <div
                              className="h-10 rounded-r-lg transition-all hover:opacity-90"
                              style={{
                                width: `${(item.value / Math.max(...viz.data.map((d: any) => d.value))) * 100}%`,
                                background: `linear-gradient(90deg, ${colors[barIdx % colors.length]}dd, ${colors[barIdx % colors.length]})`,
                                minWidth: '40px'
                              }}
                            >
                              <span className="px-3 py-2 text-sm font-semibold text-white">
                                {item.value}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {viz.type === 'stacked-crosstab' && (
                <BarChartV2
                  data={viz.data}
                  xKey={viz.xKey}
                  yKeys={viz.yKeys}
                  orientation="horizontal"
                  stacked
                  showLegend
                  showDataLabels
                  colors={generateCategoricalPalette(viz.yKeys.length)}
                  valueFormatter={(v) => `${v}%`}
                  height={Math.max(350, viz.data.length * 100)}
                  xLabel="Percentage"
                  showGrid={true}
                />
              )}

              {/* Data Table Below Chart */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Data Table</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {viz.tableData.length > 0 && Object.keys(viz.tableData[0]).map((key) => (
                          <th
                            key={key}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {viz.tableData.map((row: any, rowIdx: number) => (
                        <tr key={rowIdx} className="hover:bg-gray-50">
                          {Object.values(row).map((value: any, colIdx: number) => (
                            <td
                              key={colIdx}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                            >
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/')}>
            Upload New Data
          </Button>
          <Button variant="secondary" onClick={() => navigate('/insights')}>
            View Text Insights
          </Button>
        </div>
      </div>
    </div>
  );
}
