/**
 * GitHub Service - Clean Architecture Implementation
 *
 * This service provides GitHub App integration with multi-tenant support
 * using a clean, functional programming approach with proper separation of concerns.
 */

// Common reusable modules
export * from './common/doppler/github-secrets';
export * from './common/supabase/github-queries';

// Producer modules (GitHub API operations)
export * from './producer/github/jwt';
export * from './producer/github/auth';
export * from './producer/github/octokit';

// Consumer modules (Webhook handling)
export * from './consumer/handlers/installation-created';
export * from './consumer/handlers/installation-deleted';
export * from './consumer/webhooks/github-webhook';

// Examples for integration
export * from './examples/jordan-integration';

// Legacy exports (for backward compatibility)
export * from './types.js';
export * from './github-service.js';

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

/**
 * Main functions for Jordan's PM Tools:
 *
 * 1. createOctokitForOrg(orgName) - Get authenticated GitHub client
 * 2. getInstallationIdByOrg(orgName) - Get installation ID from Supabase
 * 3. createIssueForOrg() - Example issue creation
 * 4. createRepoForOrg() - Example repository creation
 *
 * Architecture:
 * - common/ - Reusable Doppler and Supabase modules
 * - producer/ - GitHub API operations (auth, JWT, Octokit)
 * - consumer/ - Webhook event handling
 * - examples/ - Integration examples for Jordan's tools
 */
