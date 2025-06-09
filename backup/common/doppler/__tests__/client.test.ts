/**
 * Doppler Client Tests
 * Comprehensive test suite for reusable Doppler client
 */
import { getSecret, updateSecret } from '../client';

// Mock @dopplerhq/node-sdk
const mockSecretsGet = jest.fn();
const mockSecretsUpdate = jest.fn();

jest.mock('@dopplerhq/node-sdk', () => {
  return jest.fn().mockImplementation(() => ({
    secrets: {
      get: mockSecretsGet,
      update: mockSecretsUpdate
    }
  }));
});

describe('Doppler Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.warn = jest.fn();
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Reset environment variables
    delete process.env.DOPPLER_TOKEN;
    delete process.env.TEST_SECRET;
  });

  describe('getSecret', () => {
    it('should get secret from Doppler when token is available', async () => {
      process.env.DOPPLER_TOKEN = 'dp.test.token';
      mockSecretsGet.mockResolvedValue({
        value: { computed: 'secret-value' }
      });

      const result = await getSecret('TEST_SECRET');

      expect(result).toBe('secret-value');
      expect(mockSecretsGet).toHaveBeenCalledWith('ai-sdlc', 'prd', 'TEST_SECRET');
    });

    it('should fallback to environment variable when Doppler fails', async () => {
      process.env.DOPPLER_TOKEN = 'dp.test.token';
      process.env.TEST_SECRET = 'env-value';
      mockSecretsGet.mockRejectedValue(new Error('Doppler API error'));

      const result = await getSecret('TEST_SECRET');

      expect(result).toBe('env-value');
      expect(console.warn).toHaveBeenCalledWith(
        '⚠️ Doppler failed for TEST_SECRET, using .env fallback:',
        expect.any(Error)
      );
    });

    it('should use environment variable when no Doppler token', async () => {
      process.env.TEST_SECRET = 'env-value';

      const result = await getSecret('TEST_SECRET');

      expect(result).toBe('env-value');
      expect(mockSecretsGet).not.toHaveBeenCalled();
    });

    it('should return empty string when secret not found anywhere', async () => {
      const result = await getSecret('NONEXISTENT_SECRET');

      expect(result).toBe('');
    });

    it('should handle Doppler network timeout', async () => {
      process.env.DOPPLER_TOKEN = 'dp.test.token';
      process.env.TEST_SECRET = 'fallback-value';
      
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      mockSecretsGet.mockRejectedValue(timeoutError);

      const result = await getSecret('TEST_SECRET');

      expect(result).toBe('fallback-value');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should handle Doppler authentication errors', async () => {
      process.env.DOPPLER_TOKEN = 'invalid-token';
      process.env.TEST_SECRET = 'fallback-value';
      
      const authError = new Error('Unauthorized');
      authError.name = 'AuthenticationError';
      mockSecretsGet.mockRejectedValue(authError);

      const result = await getSecret('TEST_SECRET');

      expect(result).toBe('fallback-value');
    });

    it('should handle concurrent secret requests', async () => {
      process.env.DOPPLER_TOKEN = 'dp.test.token';
      mockSecretsGet
        .mockResolvedValueOnce({ value: { computed: 'secret1' } })
        .mockResolvedValueOnce({ value: { computed: 'secret2' } })
        .mockResolvedValueOnce({ value: { computed: 'secret3' } });

      const promises = [
        getSecret('SECRET1'),
        getSecret('SECRET2'),
        getSecret('SECRET3')
      ];

      const results = await Promise.all(promises);

      expect(results).toEqual(['secret1', 'secret2', 'secret3']);
      expect(mockSecretsGet).toHaveBeenCalledTimes(3);
    });
  });

  describe('updateSecret', () => {
    it('should update secret in Doppler successfully', async () => {
      process.env.DOPPLER_TOKEN = 'dp.test.token';
      mockSecretsUpdate.mockResolvedValue({});

      await updateSecret('TEST_SECRET', 'new-value');

      expect(mockSecretsUpdate).toHaveBeenCalledWith({
        project: 'ai-sdlc',
        config: 'prd',
        secrets: {
          TEST_SECRET: 'new-value'
        }
      });
      expect(console.log).toHaveBeenCalledWith('✅ Updated TEST_SECRET in Doppler');
    });

    it('should throw error when no Doppler token available', async () => {
      await expect(updateSecret('TEST_SECRET', 'new-value')).rejects.toThrow('DOPPLER_TOKEN not available');

      expect(mockSecretsUpdate).not.toHaveBeenCalled();
    });

    it('should handle Doppler update failures', async () => {
      process.env.DOPPLER_TOKEN = 'dp.test.token';
      const updateError = new Error('Update failed');
      mockSecretsUpdate.mockRejectedValue(updateError);

      await expect(updateSecret('TEST_SECRET', 'new-value')).rejects.toThrow('Update failed');

      expect(console.error).toHaveBeenCalledWith('❌ Failed to update TEST_SECRET:', updateError);
    });

    it('should handle network errors during update', async () => {
      process.env.DOPPLER_TOKEN = 'dp.test.token';
      const networkError = new Error('Network unreachable');
      networkError.name = 'NetworkError';
      mockSecretsUpdate.mockRejectedValue(networkError);

      await expect(updateSecret('TEST_SECRET', 'new-value')).rejects.toThrow('Network unreachable');
    });

    it('should handle concurrent update requests', async () => {
      process.env.DOPPLER_TOKEN = 'dp.test.token';
      mockSecretsUpdate.mockResolvedValue({});

      const promises = [
        updateSecret('SECRET1', 'value1'),
        updateSecret('SECRET2', 'value2'),
        updateSecret('SECRET3', 'value3')
      ];

      await Promise.all(promises);

      expect(mockSecretsUpdate).toHaveBeenCalledTimes(3);
      expect(console.log).toHaveBeenCalledTimes(3);
    });

    it('should handle special characters in secret values', async () => {
      process.env.DOPPLER_TOKEN = 'dp.test.token';
      mockSecretsUpdate.mockResolvedValue({});

      const specialValue = 'secret!@#$%^&*()_+-={}[]|\\:";\'<>?,./';
      await updateSecret('SPECIAL_SECRET', specialValue);

      expect(mockSecretsUpdate).toHaveBeenCalledWith({
        project: 'ai-sdlc',
        config: 'prd',
        secrets: {
          SPECIAL_SECRET: specialValue
        }
      });
    });

    it('should handle empty secret values', async () => {
      process.env.DOPPLER_TOKEN = 'dp.test.token';
      mockSecretsUpdate.mockResolvedValue({});

      await updateSecret('EMPTY_SECRET', '');

      expect(mockSecretsUpdate).toHaveBeenCalledWith({
        project: 'ai-sdlc',
        config: 'prd',
        secrets: {
          EMPTY_SECRET: ''
        }
      });
    });
  });
});
