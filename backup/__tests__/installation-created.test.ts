/**
 * Installation Created Handler Tests
 * Simplified test suite for clean architecture
 */
import { handleInstallationCreated } from '@/app/api/github/webhooks/handlers/installation-created';

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

  it('should handle Supabase insertion errors', async () => {
    mockSupabaseSelect.mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' }
      })
    });

    await expect(handleInstallationCreated(mockEvent)).rejects.toThrow('Supabase insertion failed: Database connection failed');
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
  });
});
