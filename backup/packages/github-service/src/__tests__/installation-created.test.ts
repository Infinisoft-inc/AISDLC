/**
 * Unit tests for installation-created handler
 * Tests the critical installation management functionality
 */
// Mock Supabase queries
jest.mock('../common/supabase/github-queries', () => ({
  insertInstallation: jest.fn(),
  GitHubInstallation: {}
}));

import { handleInstallationCreated } from '../consumer/handlers/installation-created';
import { insertInstallation } from '../common/supabase/github-queries';

// Mock the logger to avoid console output during tests
jest.mock('@brainstack/log', () => ({
  createLogger: () => ({
    info: jest.fn(),
    verbose: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn()
  }),
  consoleIntegration: jest.fn(),
  LogLevel: {
    VERBOSE: 5
  }
}));

const mockInsertInstallation = insertInstallation as jest.MockedFunction<typeof insertInstallation>;

describe('handleInstallationCreated', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup successful response by default
    mockInsertInstallation.mockResolvedValue({
      id: 1,
      installation_id: 12345,
      account_id: 67890,
      account_login: 'test-org',
      account_type: 'Organization',
      permissions: {},
      repository_selection: 'all',
      created_at: '2025-01-07T12:00:00Z',
      updated_at: '2025-01-07T12:00:00Z'
    });
  });

  const mockEvent = {
    payload: {
      installation: {
        id: 12345,
        account: {
          login: 'test-org',
          type: 'Organization',
          id: 67890
        },
        permissions: {
          issues: 'write',
          contents: 'read'
        },
        created_at: '2025-01-07T12:00:00Z',
        app_id: 123456
      }
    }
  };

  it('should successfully process installation created event', async () => {
    await handleInstallationCreated(mockEvent);

    expect(mockInsertInstallation).toHaveBeenCalledWith({
      installation_id: 12345,
      account_id: 67890,
      account_login: 'test-org',
      account_type: 'Organization',
      permissions: {
        issues: 'write',
        contents: 'read'
      },
      repository_selection: 'all',
      created_at: '2025-01-07T12:00:00Z',
      updated_at: expect.any(String)
    });
  });

  it('should handle organization names with special characters', async () => {
    const eventWithSpecialChars = {
      payload: {
        installation: {
          id: 54321,
          account: {
            login: 'test-org-123_special',
            type: 'Organization',
            id: 98765
          },
          permissions: {},
          repository_selection: 'all',
          created_at: '2025-01-07T12:00:00Z'
        }
      }
    };

    await handleInstallationCreated(eventWithSpecialChars);

    expect(mockInsertInstallation).toHaveBeenCalledWith({
      installation_id: 54321,
      account_id: 98765,
      account_login: 'test-org-123_special',
      account_type: 'Organization',
      permissions: {},
      repository_selection: 'all',
      created_at: '2025-01-07T12:00:00Z',
      updated_at: expect.any(String)
    });
  });

  it('should handle user account installations', async () => {
    const userEvent = {
      payload: {
        installation: {
          id: 99999,
          account: {
            login: 'individual-user',
            type: 'User',
            id: 11111
          },
          permissions: {},
          repository_selection: 'selected',
          created_at: '2025-01-07T13:00:00Z'
        }
      }
    };

    await handleInstallationCreated(userEvent);

    expect(mockInsertInstallation).toHaveBeenCalledWith({
      installation_id: 99999,
      account_id: 11111,
      account_login: 'individual-user',
      account_type: 'User',
      permissions: {},
      repository_selection: 'selected',
      created_at: '2025-01-07T13:00:00Z',
      updated_at: expect.any(String)
    });
  });

  it('should throw error when Supabase insert fails', async () => {
    const supabaseError = new Error('Supabase insertion failed: Database connection failed');
    mockInsertInstallation.mockRejectedValue(supabaseError);

    await expect(handleInstallationCreated(mockEvent)).rejects.toThrow('Supabase insertion failed: Database connection failed');

    expect(mockInsertInstallation).toHaveBeenCalled();
  });

  it('should handle network timeout errors', async () => {
    const timeoutError = new Error('Request timeout');
    timeoutError.name = 'TimeoutError';
    mockInsertInstallation.mockRejectedValue(timeoutError);

    await expect(handleInstallationCreated(mockEvent)).rejects.toThrow('Request timeout');
  });

  it('should handle malformed event payload', async () => {
    const malformedEvent = {
      payload: {
        installation: {
          // Missing required fields
          id: 12345
          // account is missing
        }
      }
    };

    await expect(handleInstallationCreated(malformedEvent)).rejects.toThrow();
  });

  it('should handle installation ID as number', async () => {
    const eventWithNumberId = {
      payload: {
        installation: {
          id: 12345, // Number type
          account: {
            login: 'test-org',
            type: 'Organization',
            id: 67890
          },
          permissions: {},
          repository_selection: 'all',
          created_at: '2025-01-07T12:00:00Z'
        }
      }
    };

    await handleInstallationCreated(eventWithNumberId);

    // Verify the ID is stored as number in Supabase
    expect(mockInsertInstallation).toHaveBeenCalledWith({
      installation_id: 12345, // Number type for Supabase
      account_id: 67890,
      account_login: 'test-org',
      account_type: 'Organization',
      permissions: {},
      repository_selection: 'all',
      created_at: '2025-01-07T12:00:00Z',
      updated_at: expect.any(String)
    });
  });
});
