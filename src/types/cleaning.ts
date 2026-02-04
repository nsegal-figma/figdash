/**
 * Data Cleaning Types
 * Comprehensive type definitions for survey data cleaning operations
 */

export type CleaningMode = 'auto' | 'manual';

export type IssueType =
  | 'duplicate'
  | 'speeder'
  | 'straightLiner'
  | 'outlier'
  | 'missingData'
  | 'textIssue';

export type OutlierMethod = 'iqr' | 'zscore';

export type MissingDataStrategy =
  | 'leave'
  | 'remove'
  | 'impute-mean'
  | 'impute-median'
  | 'impute-mode'
  | 'flag';

// Detection Results

export interface DuplicateIssue {
  type: 'duplicate';
  rowIndices: number[]; // Indices of duplicate rows
  groupId: string; // ID of the duplicate group
  similarity: number; // 0-1 similarity score
}

export interface SpeederIssue {
  type: 'speeder';
  rowIndex: number;
  completionTime: number; // in seconds
  threshold: number; // threshold used
  percentile: number; // how fast compared to others
}

export interface StraightLinerIssue {
  type: 'straightLiner';
  rowIndex: number;
  columns: string[]; // Affected Likert columns
  variance: number; // Low variance indicates straight-lining
  threshold: number; // variance threshold used
}

export interface OutlierIssue {
  type: 'outlier';
  rowIndex: number;
  column: string;
  value: number;
  method: OutlierMethod;
  score: number; // z-score or IQR distance
}

export interface MissingDataIssue {
  type: 'missingData';
  column: string;
  rowIndices: number[];
  missingCount: number;
  totalCount: number;
  percentage: number;
}

export interface TextIssue {
  type: 'textIssue';
  rowIndex: number;
  column: string;
  value: string;
  issues: string[]; // e.g., ['repeated-chars', 'too-short', 'nonsense']
}

export type DetectionIssue =
  | DuplicateIssue
  | SpeederIssue
  | StraightLinerIssue
  | OutlierIssue
  | MissingDataIssue
  | TextIssue;

// Cleaning Settings

export interface CleaningSettings {
  // General
  mode: CleaningMode;
  preserveOriginal: boolean;

  // Duplicate detection
  duplicates: {
    enabled: boolean;
    compareByRespondentId: boolean;
    similarityThreshold: number; // 0-1, default 0.95
    keepStrategy: 'first' | 'last' | 'most-complete';
  };

  // Speeder detection
  speeders: {
    enabled: boolean;
    method: 'absolute' | 'percentile' | 'median-multiple';
    absoluteThreshold?: number; // seconds
    percentileThreshold?: number; // 0-100, e.g., 5 for bottom 5%
    medianMultiple?: number; // e.g., 0.3 for < 30% of median
  };

  // Straight-liner detection
  straightLiners: {
    enabled: boolean;
    varianceThreshold: number; // default 0.5
    minimumQuestions: number; // default 5
    likertColumns?: string[]; // if specified, only check these
  };

  // Outlier detection
  outliers: {
    enabled: boolean;
    method: OutlierMethod;
    zScoreThreshold?: number; // default 3
    iqrMultiple?: number; // default 1.5
    columns?: string[]; // if specified, only check these
    action: 'flag' | 'remove' | 'cap'; // cap = winsorize
  };

  // Missing data
  missingData: {
    enabled: boolean;
    strategy: MissingDataStrategy;
    threshold?: number; // % missing to trigger action, default 50
    columns?: string[]; // if specified, only clean these
  };

  // Text cleaning
  textCleaning: {
    enabled: boolean;
    trimWhitespace: boolean;
    removeUrls: boolean;
    removeSpecialChars: boolean;
    detectGibberish: boolean;
    minimumLength: number; // default 2
    maximumRepeatedChars: number; // default 3
  };
}

// Cleaning Actions

export interface CleaningAction {
  type: IssueType;
  description: string;
  affected: {
    rows?: number[];
    columns?: string[];
    count: number;
  };
  before?: any;
  after?: any;
}

// Cleaning Report

export interface CleaningReport {
  timestamp: Date;
  mode: CleaningMode;
  settings: CleaningSettings;

  // Summary
  summary: {
    originalRows: number;
    originalColumns: number;
    finalRows: number;
    finalColumns: number;
    rowsRemoved: number;
    rowsFlagged: number;
    columnsModified: number;
    valuesImputed: number;
  };

  // Detected Issues
  issuesDetected: {
    duplicates: DuplicateIssue[];
    speeders: SpeederIssue[];
    straightLiners: StraightLinerIssue[];
    outliers: OutlierIssue[];
    missingData: MissingDataIssue[];
    textIssues: TextIssue[];
  };

  // Actions Applied
  actionsApplied: CleaningAction[];

  // Execution metadata
  executionTime: number; // milliseconds
  errors: string[];
  warnings: string[];
}

// Default Settings

export const DEFAULT_CLEANING_SETTINGS: CleaningSettings = {
  mode: 'auto',
  preserveOriginal: true,

  duplicates: {
    enabled: true,
    compareByRespondentId: true,
    similarityThreshold: 0.95,
    keepStrategy: 'most-complete',
  },

  speeders: {
    enabled: true,
    method: 'median-multiple',
    medianMultiple: 0.3,
  },

  straightLiners: {
    enabled: true,
    varianceThreshold: 0.5,
    minimumQuestions: 5,
  },

  outliers: {
    enabled: true,
    method: 'iqr',
    iqrMultiple: 1.5,
    action: 'flag',
  },

  missingData: {
    enabled: true,
    strategy: 'leave',
    threshold: 50,
  },

  textCleaning: {
    enabled: true,
    trimWhitespace: true,
    removeUrls: false,
    removeSpecialChars: false,
    detectGibberish: true,
    minimumLength: 2,
    maximumRepeatedChars: 3,
  },
};
