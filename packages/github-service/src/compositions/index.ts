/**
 * GitHub Service - Composition Functions
 * Export all composition functions that preserve customizations
 */

// Epic composition
export { createEpic } from './createEpic';
export type { EpicData, EpicResponse } from './createEpic';

// Feature composition
export { createFeature } from './createFeature';
export type { FeatureData, FeatureResponse } from './createFeature';

// Task composition
export { createTask } from './createTask';
export type { TaskData, TaskResponse } from './createTask';
