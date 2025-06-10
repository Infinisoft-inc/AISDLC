/**
 * GitHub Operations - Export all GitHub functions
 * Single responsibility: Export all GitHub-related operations
 */

export { createProjectStructure } from './createProjectStructure.js';
export { createProjectKickoff } from './createProjectKickoff.js';
export { createDocumentStructure } from './createDocumentStructure.js';
export type { ProjectStructureData, ProjectStructureResult } from './createProjectStructure.js';
export type { DocumentStructureData, DocumentStructureResult } from './createDocumentStructure.js';

export { createEpicIssue } from './createEpicIssue.js';
export type { EpicIssueData, EpicIssueResult } from './createEpicIssue.js';

export { createFeatureIssue } from './createFeatureIssue.js';
export type { FeatureIssueData, FeatureIssueResult } from './createFeatureIssue.js';

export { createTaskIssue } from './createTaskIssue.js';
export type { TaskIssueData, TaskIssueResult } from './createTaskIssue.js';
