// Main exports for the GitHub service
export * from './types.js';
export * from './auth.js';
export * from './storage.js';
export * from './github-service.js';

// Re-export main functions for easy import
export {
  createRepository,
  createEpic,
  createFeature,
  createTask,
  addSubIssue,
  createMilestone,
  listRepositories,
  getRepository,
} from './github-service.js';

export {
  getInstallation,
  saveInstallation,
  getAllInstallations,
  saveProject,
  getProject,
  getAllProjects,
} from './storage.js';

export {
  generateJWT,
  getInstallationToken,
  createAuthenticatedOctokit,
} from './auth.js';
