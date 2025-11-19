import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurveyStore } from '../stores/useSurveyStore';
import { Card, Stat, EmptyState, Button } from '../components';
import { BarChart, PieChart } from '../components/charts';
import { calculateFrequencyDistribution, calculateDescriptiveStats } from '../lib/analytics';
import { FileText, Users, BarChart3, TrendingUp, Upload as UploadIcon } from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const { surveyData } = useSurveyStore();

  const stats = useMemo(() => {
    if (!surveyData) return null;

    const totalResponses = surveyData.totalRows;
    const totalColumns = surveyData.columns.length;
    const categoricalColumns = surveyData.columns.filter(c => c.type === 'categorical').length;
    const numericColumns = surveyData.columns.filter(c => c.type === 'number').length;

    return {
      totalResponses,
      totalColumns,
      categoricalColumns,
      numericColumns,
    };
  }, [surveyData]);

  const chartData = useMemo(() => {
    if (!surveyData) return [];

    return surveyData.columns
      .filter(col => col.type === 'categorical' || col.type === 'number')
      .slice(0, 4)
      .map(column => {
        const values = surveyData.rows.map(row => row[column.name]).filter(v => v !== '' && v != null);

        if (column.type === 'categorical') {
          const freq = calculateFrequencyDistribution(values);
          return {
            columnName: column.name,
            type: 'categorical' as const,
            data: freq.slice(0, 10).map(f => ({
              name: String(f.value),
              value: f.count,
            })),
          };
        } else {
          const numericValues = values.map(Number).filter(v => !isNaN(v));
          const stats = calculateDescriptiveStats(numericValues);
          return {
            columnName: column.name,
            type: 'numeric' as const,
            stats,
          };
        }
      });
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Survey Dashboard</h1>
          <p className="text-gray-600">
            Analyzing data from <span className="font-medium">{surveyData.fileName}</span>
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Stat
              label="Total Responses"
              value={stats.totalResponses.toLocaleString()}
              icon={<Users className="h-6 w-6" />}
            />
            <Stat
              label="Total Questions"
              value={stats.totalColumns}
              icon={<FileText className="h-6 w-6" />}
            />
            <Stat
              label="Categorical Fields"
              value={stats.categoricalColumns}
              icon={<BarChart3 className="h-6 w-6" />}
            />
            <Stat
              label="Numeric Fields"
              value={stats.numericColumns}
              icon={<TrendingUp className="h-6 w-6" />}
            />
          </div>
        )}

        {/* Visualizations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {chartData.map((item, index) => (
            <Card key={index} padding="lg">
              {item.type === 'categorical' ? (
                <>
                  <BarChart
                    data={item.data}
                    title={item.columnName}
                    yAxisLabel="Count"
                    height={300}
                  />
                  <div className="mt-4">
                    <PieChart
                      data={item.data}
                      height={250}
                      showLegend={false}
                    />
                  </div>
                </>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {item.columnName} (Numeric)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Mean</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {item.stats.mean.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Median</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {item.stats.median.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Std Dev</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {item.stats.stdDev.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Range</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {item.stats.range.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/')}>
            Upload New Data
          </Button>
          <Button onClick={() => navigate('/insights')}>
            View Insights
          </Button>
        </div>
      </div>
    </div>
  );
}

