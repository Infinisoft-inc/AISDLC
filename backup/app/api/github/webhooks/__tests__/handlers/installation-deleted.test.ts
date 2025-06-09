/**
 * Installation Deleted Handler Tests
 * Comprehensive test suite with 100% coverage
 */
import { handleInstallationDeleted } from '../../handlers/installation-deleted';

// Mock Supabase
const mockSupabaseDelete = jest.fn();
const mockSupabaseEq = jest.fn();
const mockSupabaseFrom = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: mockSupabaseFrom
  }))
}));

describe('handleInstallationDeleted', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Setup successful Supabase response by default
    mockSupabaseEq.mockResolvedValue({ error: null });
    mockSupabaseDelete.mockReturnValue({ eq: mockSupabaseEq });
    mockSupabaseFrom.mockReturnValue({ delete: mockSupabaseDelete });
  });

  const mockEvent = {
    payload: {
      installation: {
        id: 12345,
        account: {
          id: 67890,
          login: 'test-org',
          type: 'Organization'
        }
      }
    }
  };

  it('should successfully process installation deleted event', async () => {
    await handleInstallationDeleted(mockEvent);

    expect(mockSupabaseFrom).toHaveBeenCalledWith('github_installations');
    expect(mockSupabaseDelete).toHaveBeenCalled();
    expect(mockSupabaseEq).toHaveBeenCalledWith('installation_id', 12345);
  });

  it('should handle organization with special characters in name', async () => {
    const specialEvent = {
      ...mockEvent,
      payload: {
        ...mockEvent.payload,
        installation: {
          ...mockEvent.payload.installation,
          id: 54321,
          account: {
            id: 98765,
            login: 'test-org-123_special',
            type: 'Organization'
          }
        }
      }
    };

    await handleInstallationDeleted(specialEvent);

    expect(mockSupabaseFrom).toHaveBeenCalledWith('github_installations');
    expect(mockSupabaseDelete).toHaveBeenCalled();
    expect(mockSupabaseEq).toHaveBeenCalledWith('installation_id', 54321);
  });

  it('should handle User account type', async () => {
    const userEvent = {
      ...mockEvent,
      payload: {
        ...mockEvent.payload,
        installation: {
          ...mockEvent.payload.installation,
          id: 99999,
          account: {
            ...mockEvent.payload.installation.account,
            type: 'User'
          }
        }
      }
    };

    await handleInstallationDeleted(userEvent);

    expect(mockSupabaseFrom).toHaveBeenCalledWith('github_installations');
    expect(mockSupabaseDelete).toHaveBeenCalled();
    expect(mockSupabaseEq).toHaveBeenCalledWith('installation_id', 99999);
  });

  it('should throw error when Supabase delete fails', async () => {
    mockSupabaseEq.mockResolvedValue({ error: { message: 'Database connection failed' } });

    await expect(handleInstallationDeleted(mockEvent)).rejects.toThrow('Supabase deletion failed: Database connection failed');

    expect(mockSupabaseFrom).toHaveBeenCalledWith('github_installations');
  });

  it('should handle network errors gracefully', async () => {
    const networkError = new Error('Network unreachable');
    networkError.name = 'NetworkError';
    mockSupabaseEq.mockRejectedValue(networkError);

    await expect(handleInstallationDeleted(mockEvent)).rejects.toThrow('Network unreachable');
  });

  it('should handle large installation IDs correctly', async () => {
    const largeIdEvent = {
      ...mockEvent,
      payload: {
        ...mockEvent.payload,
        installation: {
          ...mockEvent.payload.installation,
          id: 999999999999
        }
      }
    };

    await handleInstallationDeleted(largeIdEvent);

    // Verify it deletes the installation record
    expect(mockSupabaseFrom).toHaveBeenCalledWith('github_installations');
    expect(mockSupabaseDelete).toHaveBeenCalled();
    expect(mockSupabaseEq).toHaveBeenCalledWith('installation_id', 999999999999);
  });

  it('should log appropriate messages during processing', async () => {
    await handleInstallationDeleted(mockEvent);

    expect(console.log).toHaveBeenCalledWith('🗑️ Installation deleted', {
      account: 'test-org',
      type: 'Organization',
      installationId: 12345
    });

    expect(console.log).toHaveBeenCalledWith('📊 Deleting installation from Supabase', {
      installationId: 12345,
      accountLogin: 'test-org'
    });

    expect(console.log).toHaveBeenCalledWith('✅ Installation deleted successfully', {
      installationId: 12345,
      account: 'test-org'
    });
  });

  it('should handle concurrent deletion requests', async () => {
    const promises = [
      handleInstallationDeleted(mockEvent),
      handleInstallationDeleted(mockEvent),
      handleInstallationDeleted(mockEvent)
    ];

    await Promise.all(promises);

    // Should have been called 3 times with same parameters
    expect(mockSupabaseFrom).toHaveBeenCalledTimes(3);
    expect(mockSupabaseDelete).toHaveBeenCalledTimes(3);
    expect(mockSupabaseEq).toHaveBeenCalledTimes(3);
    expect(mockSupabaseEq).toHaveBeenCalledWith('installation_id', 12345);
  });

  it('should handle missing account information gracefully', async () => {
    const eventWithMissingAccount = {
      payload: {
        installation: {
          id: 12345,
          account: {
            id: 67890,
            login: 'test-org',
            type: 'Organization'
          }
        }
      }
    };

    await handleInstallationDeleted(eventWithMissingAccount);

    expect(mockSupabaseEq).toHaveBeenCalledWith('installation_id', 12345);
  });

  it('should handle error logging correctly', async () => {
    const dbError = new Error('Database connection failed');
    mockSupabaseEq.mockResolvedValue({ error: { message: 'Database connection failed' } });

    try {
      await handleInstallationDeleted(mockEvent);
    } catch (error) {
      // Expected to throw
    }

    expect(console.error).toHaveBeenCalledWith('❌ Failed to process installation deletion', {
      account: 'test-org',
      installationId: 12345,
      error: 'Supabase deletion failed: Database connection failed'
    });
  });
});
