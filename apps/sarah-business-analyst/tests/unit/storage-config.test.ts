/**
 * Unit Tests for Storage Configuration
 */

import { StorageConfig, StorageOptions } from '../../src/config/storage-config.js';
import { MockStorage, FileStorage } from '../../src/services/storage/index.js';

// Mock GitHub storage and Octokit to avoid real API calls
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    rest: {
      repos: {
        getContent: jest.fn(),
        createOrUpdateFileContents: jest.fn(),
      },
    },
  })),
}));

jest.mock('../../src/services/storage/implementations/github-storage.js', () => ({
  GitHubStorage: jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue({ success: true, url: 'mock://github' })
  }))
}));

const { GitHubStorage } = require('../../src/services/storage/implementations/github-storage.js');

describe('StorageConfig', () => {
  test('should create mock storage with strongly typed options', () => {
    const options: StorageOptions = { type: 'mock' };
    const storage = StorageConfig.createStorage(options);

    expect(storage).toBeInstanceOf(MockStorage);
  });

  test('should create file storage with strongly typed options', () => {
    const options: StorageOptions = {
      type: 'file',
      basePath: '/test/path'
    };
    const storage = StorageConfig.createStorage(options);

    expect(storage).toBeInstanceOf(FileStorage);
  });

  test('should create GitHub storage with strongly typed options', () => {
    const options: StorageOptions = {
      type: 'github',
      token: 'test-token',
      owner: 'test-owner',
      repo: 'test-repo'
    };
    const storage = StorageConfig.createStorage(options);

    expect(GitHubStorage).toHaveBeenCalledWith('test-token', 'test-owner', 'test-repo', 'main');
  });

  test('should create GitHub storage with custom branch', () => {
    const options: StorageOptions = {
      type: 'github',
      token: 'test-token',
      owner: 'test-owner',
      repo: 'test-repo',
      branch: 'develop'
    };
    const storage = StorageConfig.createStorage(options);

    expect(GitHubStorage).toHaveBeenCalledWith('test-token', 'test-owner', 'test-repo', 'develop');
  });

  test('should provide type safety at compile time', () => {
    // These should all compile without errors due to discriminative unions
    
    const mockOptions: StorageOptions = { type: 'mock' };
    expect(mockOptions.type).toBe('mock');
    
    const fileOptions: StorageOptions = { type: 'file', basePath: '/path' };
    expect(fileOptions.type).toBe('file');
    expect(fileOptions.basePath).toBe('/path');
    
    const githubOptions: StorageOptions = { 
      type: 'github', 
      token: 'token', 
      owner: 'owner', 
      repo: 'repo' 
    };
    expect(githubOptions.type).toBe('github');
    expect(githubOptions.token).toBe('token');
  });

  test('should demonstrate type safety benefits', () => {
    // This test demonstrates that TypeScript would catch these errors:

    // ✅ Valid - all required properties present
    const validGitHub: StorageOptions = {
      type: 'github',
      token: 'token',
      owner: 'owner',
      repo: 'repo'
    };
    expect(validGitHub.type).toBe('github');

    // ✅ Valid - optional branch property
    const validWithBranch: StorageOptions = {
      type: 'github',
      token: 'token',
      owner: 'owner',
      repo: 'repo',
      branch: 'main'
    };
    expect(validWithBranch.branch).toBe('main');

    // Note: These would cause TypeScript compilation errors:
    // ❌ const invalid: StorageOptions = { type: 'github' }; // Missing required properties
    // ❌ const invalid: StorageOptions = { type: 'file' }; // Missing basePath
    // ❌ const invalid: StorageOptions = { type: 'unknown' }; // Invalid type
  });

  describe('Doppler Configuration', () => {
    const originalEnv = process.env.DOPPLER_CONFIG;

    afterEach(() => {
      process.env.DOPPLER_CONFIG = originalEnv;
    });

    test('should create mock storage when no Doppler config', () => {
      delete process.env.DOPPLER_CONFIG;

      const storage = StorageConfig.createFromDoppler();

      expect(storage).toBeInstanceOf(MockStorage);
    });

    test('should create GitHub storage from Doppler config', () => {
      const dopplerConfig = {
        storage: { type: 'github' },
        github: {
          token: 'test-token',
          owner: 'test-owner',
          repo: 'test-repo',
          branch: 'develop'
        }
      };

      process.env.DOPPLER_CONFIG = JSON.stringify(dopplerConfig);

      const storage = StorageConfig.createFromDoppler();

      expect(GitHubStorage).toHaveBeenCalledWith('test-token', 'test-owner', 'test-repo', 'develop');
    });

    test('should use default values for GitHub config', () => {
      const dopplerConfig = {
        storage: { type: 'github' },
        github: {
          token: 'test-token',
          repo: 'test-repo'
        }
      };

      process.env.DOPPLER_CONFIG = JSON.stringify(dopplerConfig);

      const storage = StorageConfig.createFromDoppler();

      expect(GitHubStorage).toHaveBeenCalledWith('test-token', 'Infinisoft-inc', 'test-repo', 'main');
    });

    test('should create file storage from Doppler config', () => {
      const dopplerConfig = {
        storage: { type: 'file', basePath: '/custom/path' }
      };

      process.env.DOPPLER_CONFIG = JSON.stringify(dopplerConfig);

      const storage = StorageConfig.createFromDoppler();

      expect(storage).toBeInstanceOf(FileStorage);
    });

    test('should handle invalid JSON in Doppler config', () => {
      process.env.DOPPLER_CONFIG = 'invalid-json';

      expect(() => StorageConfig.createFromDoppler()).toThrow('Invalid DOPPLER_CONFIG JSON');
    });

    test('should handle missing required GitHub properties', () => {
      const dopplerConfig = {
        storage: { type: 'github' },
        github: { token: 'test-token' } // Missing repo
      };

      process.env.DOPPLER_CONFIG = JSON.stringify(dopplerConfig);

      expect(() => StorageConfig.createFromDoppler()).toThrow('Doppler config missing required github.token or github.repo');
    });
  });
});
