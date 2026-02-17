import { describe, it, expect } from 'vitest';
import fs from 'fs';
import Papa from 'papaparse';
import { discoverInsights } from './insightDiscovery';
import { analyzeColumns } from '../../utils/csvParser';
import type { SurveyData } from '../../types/survey';

function loadCSV(filePath: string): SurveyData {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = Papa.parse(raw, { header: true, skipEmptyLines: true });
  const data = parsed.data as Record<string, string>[];
  const columns = analyzeColumns(data);

  const rows = data.map(row => {
    const typedRow: Record<string, string | number> = {};
    columns.forEach(col => {
      const value = row[col.name];
      if (value === '' || value == null) {
        typedRow[col.name] = '';
        return;
      }
      if (col.type === 'number') {
        typedRow[col.name] = Number(value);
      } else {
        typedRow[col.name] = value;
      }
    });
    return typedRow;
  });

  return {
    fileName: filePath.split('/').pop() || 'test.csv',
    columns,
    rows,
    totalRows: rows.length,
    uploadedAt: new Date(),
  };
}

describe('insightDiscovery with make-screener-test.csv', () => {
  const csvPath = '/Users/nsegal/Desktop/Demo data/make-screener-test.csv';

  it('should produce meaningful insights', () => {
    const surveyData = loadCSV(csvPath);

    console.log('\n=== DATASET SUMMARY ===');
    console.log(`Rows: ${surveyData.totalRows}`);
    console.log(`Columns: ${surveyData.columns.length}`);
    console.log('\nColumn types:');
    surveyData.columns.forEach(c => {
      const uniqueCount = c.uniqueValues?.length ?? '—';
      console.log(`  [${c.type.padEnd(11)}] ${c.name.substring(0, 80)}${c.name.length > 80 ? '...' : ''} (${uniqueCount} unique)`);
    });

    const insights = discoverInsights(surveyData);

    console.log(`\n=== INSIGHTS (${insights.length}) ===`);
    insights.forEach((insight, i) => {
      console.log(`\n${i + 1}. [${insight.type.toUpperCase()}] ${insight.title}`);
      console.log(`   ${insight.description}`);
      console.log(`   confidence=${insight.confidence.toFixed(2)} importance=${insight.importance.toFixed(2)}`);
      console.log(`   variables: ${insight.variables.map(v => v.substring(0, 50)).join(', ')}`);
    });

    expect(insights.length).toBeGreaterThan(0);
    // Should not produce trivial "Yes represents X%" insights
    insights.forEach(insight => {
      expect(insight.title).not.toMatch(/skew detected/i);
      expect(insight.description).not.toMatch(/represents \d+% of all responses/);
    });
  });
});
