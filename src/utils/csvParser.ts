import Papa from 'papaparse';
import type { ParsedCSV, Column, ColumnType, SurveyData } from '../types/survey';

/**
 * Clean column headers by removing extra spaces in acronyms
 */
function cleanColumnHeader(header: string): string {
  let cleaned = header;

  // Fix spaced acronyms: "M C P" -> "MCP", "A I" -> "AI", "Chat G P T" -> "ChatGPT"
  cleaned = cleaned.replace(/\b([A-Z])\s+([A-Z])\s+([A-Z])\s+([A-Z])\b/g, '$1$2$3$4'); // 4 letters
  cleaned = cleaned.replace(/\b([A-Z])\s+([A-Z])\s+([A-Z])\b/g, '$1$2$3'); // 3 letters
  cleaned = cleaned.replace(/\b([A-Z])\s+([A-Z])\b/g, '$1$2'); // 2 letters

  return cleaned;
}

export function formatFileName(fileName: string): string {
  // Remove .csv extension
  let formatted = fileName.replace(/\.csv$/i, '');

  // Replace underscores and hyphens with spaces
  formatted = formatted.replace(/[_-]/g, ' ');

  // Capitalize each word
  formatted = formatted
    .split(' ')
    .map(word => {
      // Keep acronyms uppercase (e.g., MCP, AI)
      if (word.length <= 3 && word.toUpperCase() === word) {
        return word.toUpperCase();
      }
      // Capitalize first letter of each word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');

  return formatted;
}

export interface DataIssues {
  hasMultipleHeaderRows: boolean;
  detectedHeaderRowIndex?: number;
  hasMetadataColumns: boolean;
  metadataColumns: string[];
  suggestedRowsToSkip: number[];
  suggestedHeaderRowIndex: number;
}

export async function parseCSV(file: File): Promise<ParsedCSV> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => cleanColumnHeader(header),
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

export async function parseCSVRaw(file: File): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as string[][]);
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
}

export function detectDataIssues(rawData: string[][]): DataIssues {
  const issues: DataIssues = {
    hasMultipleHeaderRows: false,
    hasMetadataColumns: false,
    metadataColumns: [],
    suggestedRowsToSkip: [],
    suggestedHeaderRowIndex: 0,
  };

  if (rawData.length < 2) return issues;

  // Common metadata column patterns - flexible to handle spaces and variations
  const metadataPatterns = [
    /^(start|end)\s*date$/i,
    /^start\s*time$/i,
    /^end\s*time$/i,
    /^status$/i,
    /^ip\s*address$/i,
    /^ip$/i,
    /^progress$/i,
    /^duration/i,
    /^finished$/i,
    /^recorded\s*date$/i,
    /^response\s*id$/i,
    /^response\s*type$/i,
    /^recipient/i,
    /^external.*reference$/i,
    /^location\s*latitude$/i,
    /^location\s*longitude$/i,
    /^latitude$/i,
    /^longitude$/i,
    /^distribution\s*channel$/i,
    /^user\s*language$/i,
    /^language$/i,
    /^nx$/i,
    /^red_(completed|screened|quota)$/i,
    /^q_terminateflag$/i,
    /^change$/i,
    /^screened$/i,
    /^_recordid$/i,
    /^row$/i,
    /^row\s*number$/i,
  ];

  const firstRow = rawData[0];

  // Check for metadata columns
  const detectedMetadata = firstRow.filter(header =>
    metadataPatterns.some(pattern => pattern.test(header))
  );

  if (detectedMetadata.length > 0) {
    issues.hasMetadataColumns = true;
    issues.metadataColumns = detectedMetadata;
  }

  // Check for multiple header rows (Qualtrics pattern)
  // Look for JSON-like content in first few rows
  let jsonRowIndex = -1;
  for (let i = 0; i < Math.min(5, rawData.length); i++) {
    const row = rawData[i];
    // Check if any cell starts with {" (JSON pattern)
    if (row.some(cell => cell && cell.trim().startsWith('{"'))) {
      jsonRowIndex = i;
      break;
    }
  }

  if (jsonRowIndex > 0) {
    issues.hasMultipleHeaderRows = true;
    issues.detectedHeaderRowIndex = 1; // Usually row 2 has the question text
    issues.suggestedHeaderRowIndex = 1;
    // Suggest skipping all rows except the header row, up to and including JSON row
    const rowsToSkip: number[] = [];
    for (let i = 0; i <= jsonRowIndex; i++) {
      if (i !== 1) { // Don't skip the header row (row 2, index 1)
        rowsToSkip.push(i);
      }
    }
    issues.suggestedRowsToSkip = rowsToSkip;
  }

  // Alternative check: if first data row has very long text in multiple columns
  // This might indicate row 1 has question codes and row 2 has question text
  if (!issues.hasMultipleHeaderRows && rawData.length > 1) {
    const secondRow = rawData[1];
    const longTextCells = secondRow.filter(cell => cell && cell.length > 50).length;

    if (longTextCells > firstRow.length * 0.3) {
      issues.hasMultipleHeaderRows = true;
      issues.detectedHeaderRowIndex = 1;
      issues.suggestedHeaderRowIndex = 1;
      issues.suggestedRowsToSkip = [0]; // Skip first row, use row 2 as headers
    }
  }

  return issues;
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
      name: header, // Already cleaned by transformHeader
      type,
      uniqueValues,
      hasEmptyValues: emptyCount > 0,
      emptyCount,
    };
  });
}

export function applyDataCleaning(
  rawData: string[][],
  headerRowIndex: number,
  rowIndicesToSkip: number[],
  columnsToRemove: string[]
): { headers: string[]; data: Record<string, string>[] } {
  if (headerRowIndex >= rawData.length) {
    throw new Error('Header row index is out of bounds');
  }

  // Get headers from the specified header row and clean them
  const headerRow = rawData[headerRowIndex];

  // Filter out columns to remove
  const columnIndices: number[] = [];
  const cleanHeaders = headerRow.filter((header, index) => {
    const shouldKeep = !columnsToRemove.includes(header);
    if (shouldKeep) {
      columnIndices.push(index);
    }
    return shouldKeep;
  }).map(cleanColumnHeader); // Clean acronym spacing

  // Create set for faster lookup
  const skipRowsSet = new Set(rowIndicesToSkip);
  skipRowsSet.add(headerRowIndex); // Also skip the header row from data

  // Process data rows (all rows that aren't skipped and aren't the header)
  const cleanData: Record<string, string>[] = [];
  for (let i = 0; i < rawData.length; i++) {
    if (!skipRowsSet.has(i)) {
      const row = rawData[i];
      const cleanRow: Record<string, string> = {};
      columnIndices.forEach((colIndex, j) => {
        cleanRow[cleanHeaders[j]] = row[colIndex] || '';
      });
      cleanData.push(cleanRow);
    }
  }

  return {
    headers: cleanHeaders,
    data: cleanData,
  };
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

export async function processSurveyFileFromCleaned(
  file: File,
  cleanedData: { headers: string[]; data: Record<string, string>[] }
): Promise<SurveyData> {
  const columns = analyzeColumns(cleanedData.data);

  // Convert data to proper types
  const rows = cleanedData.data.map(row => {
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






