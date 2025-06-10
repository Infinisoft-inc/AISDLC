/**
 * Examples of Strongly Typed Storage Configuration
 * Demonstrates type safety and IntelliSense benefits
 */

import { StorageConfig, StorageOptions } from '../src/config/storage-config.js';

/**
 * Example 1: Mock Storage (for testing)
 */
function createMockStorage() {
  const options: StorageOptions = { 
    type: 'mock' 
  };
  
  return StorageConfig.createStorage(options);
}

/**
 * Example 2: File Storage (for local development)
 */
function createFileStorage() {
  const options: StorageOptions = { 
    type: 'file',
    basePath: './output/documents'  // TypeScript ensures this is provided
  };
  
  return StorageConfig.createStorage(options);
}

/**
 * Example 3: GitHub Storage (for production)
 */
function createGitHubStorage() {
  const options: StorageOptions = { 
    type: 'github',
    token: process.env.GITHUB_TOKEN!,     // TypeScript ensures this is provided
    owner: 'Infinisoft-inc',              // TypeScript ensures this is provided
    repo: 'project-documents',            // TypeScript ensures this is provided
    branch: 'main'                        // Optional - TypeScript allows this
  };
  
  return StorageConfig.createStorage(options);
}

/**
 * Example 4: Environment-based Configuration
 */
function createStorageFromEnvironment(): StorageOptions {
  const env = process.env.NODE_ENV;
  
  switch (env) {
    case 'test':
      return { type: 'mock' };
      
    case 'development':
      return { 
        type: 'file', 
        basePath: './dev-output' 
      };
      
    case 'production':
      return { 
        type: 'github',
        token: process.env.GITHUB_TOKEN!,
        owner: process.env.GITHUB_OWNER || 'Infinisoft-inc',
        repo: process.env.GITHUB_REPO!,
        branch: process.env.GITHUB_BRANCH || 'main'
      };
      
    default:
      return { type: 'mock' };
  }
}

/**
 * Example 5: Type-safe Configuration Factory
 */
export class StorageFactory {
  static createForTesting(): StorageOptions {
    return { type: 'mock' };
  }
  
  static createForDevelopment(basePath: string = './output'): StorageOptions {
    return { type: 'file', basePath };
  }
  
  static createForProduction(
    token: string, 
    owner: string, 
    repo: string, 
    branch?: string
  ): StorageOptions {
    return { type: 'github', token, owner, repo, branch };
  }
}

/**
 * Example 6: Doppler Pattern (Single Secret Management)
 */
export function setupSarahStorageWithDoppler() {
  // ✅ Single secret pattern - only DOPPLER_CONFIG to manage
  return StorageConfig.createFromDoppler();
}

/**
 * Example 7: Legacy Multi-Secret Pattern (Not Recommended)
 */
export function setupSarahStorageLegacy(): StorageOptions {
  // ❌ Multiple secrets to manage - harder to maintain

  if (process.env.NODE_ENV === 'test') {
    return StorageFactory.createForTesting();
  }

  if (process.env.GITHUB_TOKEN) {
    return StorageFactory.createForProduction(
      process.env.GITHUB_TOKEN,
      process.env.GITHUB_OWNER || 'Infinisoft-inc',
      process.env.GITHUB_REPO || 'sarah-documents'
    );
  }

  return StorageFactory.createForDevelopment('./sarah-output');
}

/**
 * Benefits Demonstrated:
 *
 * ✅ Type Safety:
 *   - Compiler catches missing required properties
 *   - Prevents typos in property names
 *   - Ensures correct property types
 *
 * ✅ IntelliSense:
 *   - IDE shows available properties
 *   - Auto-completion for property names
 *   - Inline documentation
 *
 * ✅ Refactoring Safety:
 *   - Renaming properties updates all usages
 *   - Adding/removing properties shows compilation errors
 *   - Safe to modify storage interfaces
 *
 * ✅ Self-Documenting:
 *   - Types show exactly what's required
 *   - No need to check documentation
 *   - Clear contracts between components
 *
 * ✅ Doppler Pattern Benefits:
 *   - Single secret to manage (DOPPLER_CONFIG)
 *   - Centralized configuration management
 *   - Environment-specific configurations
 *   - Version control for config changes
 *   - Secure secret rotation through Doppler
 *   - No multiple environment variables to track
 */
