import Papa from 'papaparse';
import type { ParsedCSV, Column, ColumnType, SurveyData } from '../types/survey';

export async function parseCSV(file: File): Promise<ParsedCSV> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve({
          headers: results.meta.fields || [],
          data: results.data as Record<string, string>[],
        });
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
}

function detectColumnType(values: (string | number)[]): ColumnType {
  const nonEmptyValues = values.filter(v => v !== '' && v != null);
  
  if (nonEmptyValues.length === 0) return 'text';

  // Check if it's a number
  const numericValues = nonEmptyValues.filter(v => !isNaN(Number(v)));
  if (numericValues.length === nonEmptyValues.length) {
    return 'number';
  }

  // Check if it's a date
  const dateValues = nonEmptyValues.filter(v => {
    const date = new Date(v as string);
    return !isNaN(date.getTime());
  });
  if (dateValues.length === nonEmptyValues.length) {
    return 'date';
  }

  // Check if it's categorical (few unique values relative to total)
  const uniqueValues = new Set(nonEmptyValues);
  const uniqueRatio = uniqueValues.size / nonEmptyValues.length;
  
  if (uniqueRatio < 0.5 && uniqueValues.size < 20) {
    return 'categorical';
  }

  return 'text';
}

export function analyzeColumns(data: Record<string, string>[]): Column[] {
  if (data.length === 0) return [];

  const headers = Object.keys(data[0]);
  
  return headers.map(header => {
    const values = data.map(row => row[header]);
    const emptyCount = values.filter(v => v === '' || v == null).length;
    const nonEmptyValues = values.filter(v => v !== '' && v != null);
    
    const type = detectColumnType(values);
    
    let uniqueValues: string[] | undefined;
    if (type === 'categorical') {
      uniqueValues = Array.from(new Set(nonEmptyValues)).map(String).sort();
    }

    return {
      name: header,
      type,
      uniqueValues,
      hasEmptyValues: emptyCount > 0,
      emptyCount,
    };
  });
}

export async function processSurveyFile(file: File): Promise<SurveyData> {
  const parsed = await parseCSV(file);
  const columns = analyzeColumns(parsed.data);
  
  // Convert data to proper types
  const rows = parsed.data.map(row => {
    const typedRow: Record<string, string | number> = {};
    
    columns.forEach(column => {
      const value = row[column.name];
      
      if (value === '' || value == null) {
        typedRow[column.name] = '';
        return;
      }

      if (column.type === 'number') {
        typedRow[column.name] = Number(value);
      } else {
        typedRow[column.name] = value;
      }
    });

    return typedRow;
  });

  return {
    fileName: file.name,
    columns,
    rows,
    totalRows: rows.length,
    uploadedAt: new Date(),
  };
}





