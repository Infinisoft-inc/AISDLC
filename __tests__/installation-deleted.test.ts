/**
 * Installation Deleted Handler Tests
 * Simplified test suite for clean architecture
 */
import { handleInstallationDeleted } from '@/app/api/github/webhooks/handlers/installation-deleted';

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

  it('should handle Supabase deletion errors', async () => {
    mockSupabaseEq.mockResolvedValue({ error: { message: 'Database connection failed' } });

    await expect(handleInstallationDeleted(mockEvent)).rejects.toThrow('Supabase deletion failed: Database connection failed');
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

    await handleInstallationDeleted(userEvent);

    expect(mockSupabaseEq).toHaveBeenCalledWith('installation_id', 12345);
  });

  it('should log appropriate messages during processing', async () => {
    await handleInstallationDeleted(mockEvent);

    expect(console.log).toHaveBeenCalledWith('🗑️ Installation deleted', {
      account: 'test-org',
      type: 'Organization',
      installationId: 12345
    });
  });
});
