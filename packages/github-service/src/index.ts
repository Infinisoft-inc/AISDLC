/**
 * GitHub Service - Clean Architecture Implementation
 *
 * This service provides GitHub App integration with multi-tenant support
 * using a clean, functional programming approach with proper separation of concerns.
 */

// Common reusable modules
export * from './common/doppler/github-secrets.js';
export * from './common/supabase/github-queries.js';

// Producer modules (GitHub API operations)
export * from './producer/github/jwt.js';
export * from './producer/github/auth.js';
export * from './producer/github/octokit.js';

// Legacy exports (for backward compatibility)
export * from './types.js';
/**
 * GitHub Service - Refactored with Pure SRP Functions
 *
 * Layer 1: Atomic GitHub Functions (1 function per file)
 * Layer 2: Composition Functions (preserve customizations)
 */

// Export all atomic GitHub functions
export * from './github';

// Export all composition functions
export * from './compositions';

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
