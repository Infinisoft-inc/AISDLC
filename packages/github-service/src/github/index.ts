/**
 * GitHub Service - Pure SRP Functions
 * Export all atomic GitHub functions
 */

// Types
export type * from './types';

// Issue functions
export { createIssue } from './issues/createIssue.js';
export { getIssue } from './issues/getIssue.js';
export { addIssueLabel } from './issues/addIssueLabel.js';
export { setIssueType, setIssueTypeByName } from './issues/setIssueType.js';
export { addSubIssue } from './issues/addSubIssue.js';
export { getIssueTypes } from './issues/getIssueTypes.js';
export { resolveIssueTypes, hasIssueTypes, getIssueTypeId, clearIssueTypeCache } from './issues/resolveIssueTypes.js';
export { createIssueType, getOrganizationIssueTypes, ensureIssueTypes } from './issues/createIssueType.js';

// Branch functions
export { createBranch } from './branches/createBranch.js';
export { getBranch } from './branches/getBranch.js';
export { createLinkedBranch } from './branches/createLinkedBranch.js';

// Repository functions
export { createRepository } from './repositories/createRepository.js';
export { createOrgRepository } from './repositories/createOrgRepository.js';
export { getRepository } from './repositories/getRepository.js';
export { listRepositories } from './repositories/listRepositories.js';

// Comment functions
export { createComment } from './comments/createComment.js';

// Project functions
export { createProject } from './projects/createProject.js';
export { addIssueToProject } from './projects/addIssueToProject.js';
export { createProjectV2 } from './projects/createProjectV2.js';
export { addIssueToProjectV2 } from './projects/addIssueToProjectV2.js';

// Utility functions
export { generateBranchName } from './utils/generateBranchName.js';
