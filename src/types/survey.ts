export type ColumnType = 'text' | 'number' | 'categorical' | 'date';

export interface Column {
  name: string;
  type: ColumnType;
  uniqueValues?: string[];
  hasEmptyValues: boolean;
  emptyCount: number;
}

export interface SurveyData {
  fileName: string;
  columns: Column[];
  rows: Record<string, string | number>[];
  totalRows: number;
  uploadedAt: Date;
}

export interface ParsedCSV {
  headers: string[];
  data: Record<string, string>[];
}





