/**
 * GitHub Service - Pure SRP Functions
 * Export all atomic GitHub functions
 */

// Types
export type * from './types';

// Issue functions
export { createIssue } from './issues/createIssue';
export { getIssue } from './issues/getIssue';
export { addIssueLabel } from './issues/addIssueLabel';
export { setIssueType } from './issues/setIssueType';
export { addSubIssue } from './issues/addSubIssue';
export { getIssueTypes } from './issues/getIssueTypes';

// Branch functions
export { createBranch } from './branches/createBranch';
export { getBranch } from './branches/getBranch';
export { createLinkedBranch } from './branches/createLinkedBranch';

// Repository functions
export { createRepository } from './repositories/createRepository';
export { getRepository } from './repositories/getRepository';
export { listRepositories } from './repositories/listRepositories';

// Comment functions
export { createComment } from './comments/createComment';

// Project functions
export { createProject } from './projects/createProject';
export { addIssueToProject } from './projects/addIssueToProject';
export { createProjectV2 } from './projects/createProjectV2';
export { addIssueToProjectV2 } from './projects/addIssueToProjectV2';

// Utility functions
export { generateBranchName } from './utils/generateBranchName';
