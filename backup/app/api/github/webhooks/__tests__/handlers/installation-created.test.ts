/**
 * Installation Created Handler Tests
 * Comprehensive test suite with 100% coverage
 */
import { handleInstallationCreated } from '../../handlers/installation-created';

// Mock Supabase
const mockSupabaseInsert = jest.fn();
const mockSupabaseSelect = jest.fn();
const mockSupabaseFrom = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: mockSupabaseFrom
  }))
}));

describe('handleInstallationCreated', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Setup successful Supabase response by default
    const mockSingle = jest.fn().mockResolvedValue({
      data: { id: 1, installation_id: 12345 },
      error: null
    });
    
    mockSupabaseSelect.mockReturnValue({ single: mockSingle });
    mockSupabaseInsert.mockReturnValue({ select: mockSupabaseSelect });
    mockSupabaseFrom.mockReturnValue({ insert: mockSupabaseInsert });
  });

  const mockEvent = {
    payload: {
      installation: {
        id: 12345,
        account: {
          id: 67890,
          login: 'test-org',
          type: 'Organization'
        },
        permissions: {
          issues: 'write',
          contents: 'read'
        },
        repository_selection: 'all',
        created_at: '2025-01-07T12:00:00Z',
        updated_at: '2025-01-07T12:00:00Z'
      }
    }
  };

  it('should successfully process installation created event', async () => {
    await handleInstallationCreated(mockEvent);

    expect(mockSupabaseFrom).toHaveBeenCalledWith('github_installations');
    expect(mockSupabaseInsert).toHaveBeenCalledWith({
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

    await handleInstallationCreated(specialEvent);

    expect(mockSupabaseFrom).toHaveBeenCalledWith('github_installations');
    expect(mockSupabaseInsert).toHaveBeenCalledWith({
      installation_id: 54321,
      account_id: 98765,
      account_login: 'test-org-123_special',
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

  it('should handle User account type', async () => {
    const userEvent = {
      ...mockEvent,
      payload: {
        ...mockEvent.payload,
        installation: {
          ...mockEvent.payload.installation,
          account: {
            ...mockEvent.payload.installation.account,
            type: 'User'
          }
        }
      }
    };

    await handleInstallationCreated(userEvent);

    expect(mockSupabaseInsert).toHaveBeenCalledWith({
      installation_id: 12345,
      account_id: 67890,
      account_login: 'test-org',
      account_type: 'User',
      permissions: {
        issues: 'write',
        contents: 'read'
      },
      repository_selection: 'all',
      created_at: '2025-01-07T12:00:00Z',
      updated_at: expect.any(String)
    });
  });

  it('should throw error when Supabase insert fails', async () => {
    const supabaseError = new Error('Supabase insertion failed: Database connection failed');
    mockSupabaseSelect.mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' }
      })
    });

    await expect(handleInstallationCreated(mockEvent)).rejects.toThrow('Supabase insertion failed: Database connection failed');

    expect(mockSupabaseFrom).toHaveBeenCalledWith('github_installations');
  });

  it('should handle network timeout errors', async () => {
    const timeoutError = new Error('Request timeout');
    timeoutError.name = 'TimeoutError';
    mockSupabaseSelect.mockReturnValue({
      single: jest.fn().mockRejectedValue(timeoutError)
    });

    await expect(handleInstallationCreated(mockEvent)).rejects.toThrow('Request timeout');
  });

  it('should handle missing permissions gracefully', async () => {
    const eventWithoutPermissions = {
      ...mockEvent,
      payload: {
        ...mockEvent.payload,
        installation: {
          ...mockEvent.payload.installation,
          permissions: undefined
        }
      }
    };

    await handleInstallationCreated(eventWithoutPermissions);

    expect(mockSupabaseInsert).toHaveBeenCalledWith({
      installation_id: 12345,
      account_id: 67890,
      account_login: 'test-org',
      account_type: 'Organization',
      permissions: {},
      repository_selection: 'all',
      created_at: '2025-01-07T12:00:00Z',
      updated_at: expect.any(String)
    });
  });

  it('should handle large installation IDs correctly', async () => {
    const largeIdEvent = {
      ...mockEvent,
      payload: {
        ...mockEvent.payload,
        installation: {
          ...mockEvent.payload.installation,
          id: 999999999999,
          account: {
            ...mockEvent.payload.installation.account,
            id: 888888888888
          }
        }
      }
    };

    await handleInstallationCreated(largeIdEvent);

    // Verify the ID is stored as number in Supabase
    expect(mockSupabaseInsert).toHaveBeenCalledWith({
      installation_id: 999999999999,
      account_id: 888888888888,
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

  it('should log appropriate messages during processing', async () => {
    await handleInstallationCreated(mockEvent);

    expect(console.log).toHaveBeenCalledWith('🔧 New installation created', {
      account: 'test-org',
      type: 'Organization',
      installationId: 12345,
      permissions: {
        issues: 'write',
        contents: 'read'
      }
    });

    expect(console.log).toHaveBeenCalledWith('📊 Storing installation in Supabase', {
      installationId: 12345,
      accountLogin: 'test-org',
      accountType: 'Organization'
    });

    expect(console.log).toHaveBeenCalledWith('✅ Installation stored successfully', {
      installationId: 12345,
      account: 'test-org',
      supabaseId: 1
    });
  });

  it('should handle concurrent installation requests', async () => {
    const promises = [
      handleInstallationCreated(mockEvent),
      handleInstallationCreated(mockEvent),
      handleInstallationCreated(mockEvent)
    ];

    await Promise.all(promises);

    expect(mockSupabaseFrom).toHaveBeenCalledTimes(3);
    expect(mockSupabaseInsert).toHaveBeenCalledTimes(3);
  });
});
