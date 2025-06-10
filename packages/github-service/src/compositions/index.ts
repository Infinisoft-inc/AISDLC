/**
 * GitHub Service - Composition Functions
 * Export all composition functions that preserve customizations
 */

// Epic composition
export { createEpic } from './createEpic.js';
export type { EpicData, EpicResponse } from './createEpic.js';

// Feature composition
export { createFeature } from './createFeature.js';
export type { FeatureData, FeatureResponse } from './createFeature.js';

// Task composition
export { createTask } from './createTask.js';
export type { TaskData, TaskResponse } from './createTask.js';
