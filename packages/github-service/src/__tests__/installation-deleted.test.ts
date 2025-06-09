/**
 * Unit tests for installation-deleted handler
 * Tests the critical installation cleanup functionality
 */
// Mock Supabase queries
jest.mock('../common/supabase/github-queries', () => ({
  deleteInstallation: jest.fn()
}));

import { handleInstallationDeleted } from '../consumer/handlers/installation-deleted';
import { deleteInstallation } from '../common/supabase/github-queries';

const mockDeleteInstallation = deleteInstallation as jest.MockedFunction<typeof deleteInstallation>;

// Mock the logger
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

describe('handleInstallationDeleted', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup successful response by default
    mockDeleteInstallation.mockResolvedValue();
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
        }
      }
    }
  };

  it('should successfully process installation deleted event', async () => {
    await handleInstallationDeleted(mockEvent);

    expect(mockDeleteInstallation).toHaveBeenCalledWith(12345);
  });

  it('should handle organization names with special characters', async () => {
    const eventWithSpecialChars = {
      payload: {
        installation: {
          id: 54321,
          account: {
            login: 'test-org-123_special',
            type: 'Organization'
          },
          permissions: {}
        }
      }
    };

    await handleInstallationDeleted(eventWithSpecialChars);

    expect(mockDeleteInstallation).toHaveBeenCalledWith(54321);
  });

  it('should handle user account deletions', async () => {
    const userEvent = {
      payload: {
        installation: {
          id: 99999,
          account: {
            login: 'individual-user',
            type: 'User'
          },
          permissions: {}
        }
      }
    };

    await handleInstallationDeleted(userEvent);

    expect(mockDeleteInstallation).toHaveBeenCalledWith(99999);
  });

  it('should throw error when Supabase delete fails', async () => {
    const deleteError = new Error('Supabase deletion failed: Database connection failed');
    mockDeleteInstallation.mockRejectedValue(deleteError);

    await expect(handleInstallationDeleted(mockEvent)).rejects.toThrow('Supabase deletion failed: Database connection failed');

    expect(mockDeleteInstallation).toHaveBeenCalledWith(12345);
  });

  it('should handle network errors gracefully', async () => {
    const networkError = new Error('Network unreachable');
    networkError.name = 'NetworkError';
    mockDeleteInstallation.mockRejectedValue(networkError);

    await expect(handleInstallationDeleted(mockEvent)).rejects.toThrow('Network unreachable');
  });

  it('should handle malformed event payload', async () => {
    const malformedEvent = {
      payload: {
        installation: {
          id: 12345
          // account is missing
        }
      }
    };

    await expect(handleInstallationDeleted(malformedEvent)).rejects.toThrow();
  });

  it('should delete installation record from database', async () => {
    await handleInstallationDeleted(mockEvent);

    // Verify it deletes the installation record
    expect(mockDeleteInstallation).toHaveBeenCalledWith(12345);
  });

  it('should handle concurrent deletion attempts', async () => {
    // Simulate multiple deletion events for same installation
    const promises = [
      handleInstallationDeleted(mockEvent),
      handleInstallationDeleted(mockEvent),
      handleInstallationDeleted(mockEvent)
    ];

    await Promise.all(promises);

    // Should have been called 3 times with same parameters
    expect(mockDeleteInstallation).toHaveBeenCalledTimes(3);
    expect(mockDeleteInstallation).toHaveBeenCalledWith(12345);
  });
});
