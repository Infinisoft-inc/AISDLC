/**
 * Shared Types for Business Case Tools
 * Common interfaces and types used across business case tools
 */

// ===== STORE BUSINESS CASE TYPES =====

export interface StoreBusinessCaseResult {
  projectId: string;
  stored: boolean;
  timestamp: string;
}

// ===== SUMMARIZE BUSINESS CASE TYPES =====

export interface SummarizeBusinessCaseArgs {
  projectId: string;
}

export interface SummarizeBusinessCaseResult {
  projectId: string;
  summary: string;
  completionStatus: string;
}
