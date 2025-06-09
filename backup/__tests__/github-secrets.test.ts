import {
  getGitHubAppId,
  getGitHubPrivateKey,
  getGitHubClientId,
  getGitHubClientSecret,
  getGitHubWebhookSecret,
  getSupabaseUrl,
  getSupabaseServiceKey
} from '@/common/doppler/github-secrets';

jest.mock('@/common/doppler/client', () => ({
  getSecret: jest.fn()
}));

import { getSecret } from '@/common/doppler/client';
const mockGetSecret = getSecret as jest.MockedFunction<typeof getSecret>;

describe('GitHub Secrets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGitHubAppId', () => {
    it('should get GitHub App ID', async () => {
      mockGetSecret.mockResolvedValue('123456');
      const result = await getGitHubAppId();
      expect(result).toBe('123456');
      expect(mockGetSecret).toHaveBeenCalledWith('GITHUB_APP_ID');
    });

    it('should handle empty App ID', async () => {
      mockGetSecret.mockResolvedValue('');
      const result = await getGitHubAppId();
      expect(result).toBe('');
    });
  });

  describe('getGitHubPrivateKey', () => {
    it('should get GitHub private key', async () => {
      const mockPrivateKey = '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----';
      mockGetSecret.mockResolvedValue(mockPrivateKey);
      const result = await getGitHubPrivateKey();
      expect(result).toBe(mockPrivateKey);
      expect(mockGetSecret).toHaveBeenCalledWith('GITHUB_PRIVATE_KEY');
    });
  });

  describe('getGitHubClientId', () => {
    it('should get GitHub Client ID', async () => {
      mockGetSecret.mockResolvedValue('Iv1.abcd1234');
      const result = await getGitHubClientId();
      expect(result).toBe('Iv1.abcd1234');
      expect(mockGetSecret).toHaveBeenCalledWith('GITHUB_CLIENT_ID');
    });
  });

  describe('getGitHubClientSecret', () => {
    it('should get GitHub Client Secret', async () => {
      mockGetSecret.mockResolvedValue('client-secret-value');
      const result = await getGitHubClientSecret();
      expect(result).toBe('client-secret-value');
      expect(mockGetSecret).toHaveBeenCalledWith('GITHUB_CLIENT_SECRET');
    });
  });

  describe('getGitHubWebhookSecret', () => {
    it('should get GitHub Webhook Secret', async () => {
      mockGetSecret.mockResolvedValue('webhook-secret-value');
      const result = await getGitHubWebhookSecret();
      expect(result).toBe('webhook-secret-value');
      expect(mockGetSecret).toHaveBeenCalledWith('GITHUB_WEBHOOK_SECRET');
    });

    it('should handle empty webhook secret', async () => {
      mockGetSecret.mockResolvedValue('');
      const result = await getGitHubWebhookSecret();
      expect(result).toBe('');
    });
  });

  describe('getSupabaseUrl', () => {
    it('should get Supabase URL', async () => {
      mockGetSecret.mockResolvedValue('https://project.supabase.co');
      const result = await getSupabaseUrl();
      expect(result).toBe('https://project.supabase.co');
      expect(mockGetSecret).toHaveBeenCalledWith('NEXT_PUBLIC_SUPABASE_URL');
    });
  });

  describe('getSupabaseServiceKey', () => {
    it('should get Supabase Service Role Key', async () => {
      mockGetSecret.mockResolvedValue('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
      const result = await getSupabaseServiceKey();
      expect(result).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
      expect(mockGetSecret).toHaveBeenCalledWith('SUPABASE_SERVICE_ROLE_KEY');
    });
  });

  describe('concurrent secret requests', () => {
    it('should handle multiple concurrent secret requests', async () => {
      mockGetSecret
        .mockResolvedValueOnce('123456')
        .mockResolvedValueOnce('private-key')
        .mockResolvedValueOnce('client-id')
        .mockResolvedValueOnce('client-secret')
        .mockResolvedValueOnce('webhook-secret');

      const promises = [
        getGitHubAppId(),
        getGitHubPrivateKey(),
        getGitHubClientId(),
        getGitHubClientSecret(),
        getGitHubWebhookSecret()
      ];

      const results = await Promise.all(promises);
      expect(results).toEqual([
        '123456',
        'private-key',
        'client-id',
        'client-secret',
        'webhook-secret'
      ]);
      expect(mockGetSecret).toHaveBeenCalledTimes(5);
    });
  });

  describe('error handling', () => {
    it('should propagate errors from getSecret', async () => {
      const secretError = new Error('Secret not found');
      mockGetSecret.mockRejectedValue(secretError);
      await expect(getGitHubAppId()).rejects.toThrow('Secret not found');
    });

    it('should handle network timeouts', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      mockGetSecret.mockRejectedValue(timeoutError);
      await expect(getGitHubPrivateKey()).rejects.toThrow('Request timeout');
    });
  });

  describe('secret validation', () => {
    it('should handle all GitHub secrets being empty', async () => {
      mockGetSecret.mockResolvedValue('');

      const results = await Promise.all([
        getGitHubAppId(),
        getGitHubPrivateKey(),
        getGitHubClientId(),
        getGitHubClientSecret(),
        getGitHubWebhookSecret()
      ]);

      expect(results).toEqual(['', '', '', '', '']);
    });
  });
});
