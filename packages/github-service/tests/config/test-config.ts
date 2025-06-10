/**
 * Centralized test configuration
 * All test settings in one place - no hardcoded values in test files
 */

export interface TestConfig {
  organization: string;
  repository: string;
  project: {
    title: string;
    description: string;
  };
  timeouts: {
    setup: number;
    standard: number;
    integration: number;
  };
  branches: {
    default: string;
    fallback: string;
  };
  labels: {
    test: string[];
    epic: string[];
    feature: string[];
    task: string[];
  };
}

/**
 * Load test configuration from environment variables with sensible defaults
 */
export function loadTestConfig(): TestConfig {
  return {
    organization: process.env.TEST_ORGANIZATION || 'Infinisoft-inc',
    repository: process.env.TEST_REPOSITORY || 'github-test',
    
    project: {
      title: process.env.TEST_PROJECT_TITLE || 'AI-SDLC Testing Project',
      description: process.env.TEST_PROJECT_DESCRIPTION || 'Testing playground for GitHub service features'
    },
    
    timeouts: {
      setup: parseInt(process.env.TEST_TIMEOUT_SETUP || '30000'),
      standard: parseInt(process.env.TEST_TIMEOUT_STANDARD || '15000'),
      integration: parseInt(process.env.TEST_TIMEOUT_INTEGRATION || '60000')
    },
    
    branches: {
      default: process.env.TEST_DEFAULT_BRANCH || 'master',
      fallback: process.env.TEST_FALLBACK_BRANCH || 'main'
    },
    
    labels: {
      test: ['test'],
      epic: ['test', 'integration', 'ai-sdlc'],
      feature: ['test', 'feature'],
      task: ['test', 'task']
    }
  };
}

/**
 * Get the working repository for tests
 */
export function getWorkingRepo(config: TestConfig): string {
  return config.repository;
}

/**
 * Get timeout for specific test type
 */
export function getTimeout(config: TestConfig, type: 'setup' | 'standard' | 'integration'): number {
  return config.timeouts[type];
}

/**
 * Get labels for specific issue type
 */
export function getLabels(config: TestConfig, type: 'test' | 'epic' | 'feature' | 'task'): string[] {
  return config.labels[type];
}

/**
 * Validate test configuration
 */
export function validateTestConfig(config: TestConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.organization) {
    errors.push('Organization is required');
  }
  
  if (!config.repository) {
    errors.push('Repository is required');
  }
  
  if (config.timeouts.setup < 1000) {
    errors.push('Setup timeout must be at least 1000ms');
  }
  
  if (config.timeouts.standard < 1000) {
    errors.push('Standard timeout must be at least 1000ms');
  }
  
  if (config.timeouts.integration < 1000) {
    errors.push('Integration timeout must be at least 1000ms');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
