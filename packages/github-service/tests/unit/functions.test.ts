/**
 * Unit Tests - Function Imports and Structure
 * Tests that don't require real credentials
 */

import '../setup';

describe('GitHub Service Function Imports', () => {
  test('should import all atomic issue functions', async () => {
    const { createIssue, getIssue, addIssueLabel, setIssueType, addSubIssue } = await import('../../src/github');
    
    expect(typeof createIssue).toBe('function');
    expect(typeof getIssue).toBe('function');
    expect(typeof addIssueLabel).toBe('function');
    expect(typeof setIssueType).toBe('function');
    expect(typeof addSubIssue).toBe('function');
    
    console.log('✅ All atomic issue functions imported successfully');
  });

  test('should import all atomic branch functions', async () => {
    const { createBranch, getBranch, createLinkedBranch } = await import('../../src/github');
    
    expect(typeof createBranch).toBe('function');
    expect(typeof getBranch).toBe('function');
    expect(typeof createLinkedBranch).toBe('function');
    
    console.log('✅ All atomic branch functions imported successfully');
  });

  test('should import all atomic repository functions', async () => {
    const { createRepository, getRepository, listRepositories } = await import('../../src/github');
    
    expect(typeof createRepository).toBe('function');
    expect(typeof getRepository).toBe('function');
    expect(typeof listRepositories).toBe('function');
    
    console.log('✅ All atomic repository functions imported successfully');
  });

  test('should import all composition functions', async () => {
    const { createEpic, createFeature, createTask } = await import('../../src/compositions');
    
    expect(typeof createEpic).toBe('function');
    expect(typeof createFeature).toBe('function');
    expect(typeof createTask).toBe('function');
    
    console.log('✅ All composition functions imported successfully');
  });

  test('should import utility functions', async () => {
    const { generateBranchName } = await import('../../src/github');
    
    expect(typeof generateBranchName).toBe('function');
    
    console.log('✅ All utility functions imported successfully');
  });

  test('should import types correctly', async () => {
    const types = await import('../../src/github/types');
    
    expect(types).toBeDefined();
    
    console.log('✅ All types imported successfully');
  });
});

describe('Utility Function Logic', () => {
  test('generateBranchName should create correct branch names', async () => {
    const { generateBranchName } = await import('../../src/github');
    
    // Test epic branch name (now includes timestamp)
    const epicBranch = generateBranchName('epic', { title: 'E-commerce Platform' });
    expect(epicBranch).toMatch(/^epic\/e-commerce-platform-\d{6}$/);

    // Test feature branch name (now includes timestamp)
    const featureBranch = generateBranchName('feature', { frReference: 'FR-AUTH-001' });
    expect(featureBranch).toMatch(/^feature\/fr-auth-001-\d{6}$/);

    // Test task branch name (now includes timestamp)
    const taskBranch = generateBranchName('task', { title: '[TASK] Implement JWT tokens' });
    expect(taskBranch).toMatch(/^task\/implement-jwt-tokens-\d{6}$/);
    
    console.log('✅ Branch name generation working correctly');
  });

  test('generateBranchName should handle special characters', async () => {
    const { generateBranchName } = await import('../../src/github');
    
    const branch = generateBranchName('feature', { title: 'Fix bug with @#$%^&*() characters!' });
    expect(branch).toMatch(/^feature\/fix-bug-with-characters-\d{6}$/);
    
    console.log('✅ Special character handling working correctly');
  });
});
