/**
 * Unit Tests for GitHub Storage
 */

import { GitHubStorage } from '../../src/services/storage/implementations/github-storage.js';

// Mock Octokit
const mockGetContent = jest.fn();
const mockCreateOrUpdateFileContents = jest.fn();

jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    rest: {
      repos: {
        getContent: mockGetContent,
        createOrUpdateFileContents: mockCreateOrUpdateFileContents,
      },
    },
  })),
}));

describe('GitHubStorage', () => {
  let storage: GitHubStorage;

  beforeEach(() => {
    jest.clearAllMocks();
    storage = new GitHubStorage('fake-token', 'test-owner', 'test-repo');
  });

  test('should implement StorageService interface', () => {
    expect(storage).toHaveProperty('save');
    expect(typeof storage.save).toBe('function');
  });

  test('should save new file successfully', async () => {
    // Mock file doesn't exist
    mockGetContent.mockRejectedValue(new Error('Not Found'));

    // Mock successful creation
    mockCreateOrUpdateFileContents.mockResolvedValue({
      data: {
        content: {
          html_url: 'https://github.com/test-owner/test-repo/blob/main/test.md'
        }
      }
    });

    const result = await storage.save('test.md', '# Test Document');

    expect(result.success).toBe(true);
    expect(result.url).toContain('github.com');
    expect(mockCreateOrUpdateFileContents).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: 'test-owner',
        repo: 'test-repo',
        path: 'test.md',
        message: 'Update test.md',
        content: Buffer.from('# Test Document').toString('base64'),
        branch: 'main',
      })
    );
  });

  test('should update existing file with SHA', async () => {
    // Mock file exists
    mockGetContent.mockResolvedValue({
      data: { sha: 'existing-sha' }
    });

    // Mock successful update
    mockCreateOrUpdateFileContents.mockResolvedValue({
      data: { content: { html_url: 'https://github.com/test-owner/test-repo/blob/main/test.md' } }
    });

    const result = await storage.save('test.md', '# Updated Document');

    expect(result.success).toBe(true);
    expect(mockCreateOrUpdateFileContents).toHaveBeenCalledWith(
      expect.objectContaining({
        sha: 'existing-sha',
      })
    );
  });

  test('should handle GitHub API errors', async () => {
    mockGetContent.mockRejectedValue(new Error('Not Found'));
    mockCreateOrUpdateFileContents.mockRejectedValue(new Error('API Error'));

    const result = await storage.save('test.md', '# Test');

    expect(result.success).toBe(false);
    expect(result.error).toBe('API Error');
  });

  test('should use custom branch', () => {
    const customStorage = new GitHubStorage('token', 'owner', 'repo', 'develop');
    expect(customStorage).toBeInstanceOf(GitHubStorage);
  });
});
