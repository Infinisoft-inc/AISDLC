/**
 * Doppler Integration Tests
 */

import './setup';
import { getSupabaseCredentials, getGitHubCredentials } from '../src/getDopplerSecrets';

describe('Doppler Integration', () => {
  const dopplerConfig = {
    token: process.env.DOPPLER_TOKEN!,
    project: process.env.DOPPLER_PROJECT || 'ai-sdlc',
    config: process.env.DOPPLER_CONFIG || 'prd'
  };

  test('should fetch Supabase credentials from Doppler', async () => {
    const result = await getSupabaseCredentials(dopplerConfig);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.url).toBeDefined();
    expect(result.data?.serviceRoleKey).toBeDefined();
    
    // Validate URL format
    expect(result.data?.url).toMatch(/^https:\/\/.*\.supabase\.co$/);
    
    // Validate service key format (should start with service_role key prefix)
    expect(result.data?.serviceRoleKey).toMatch(/^eyJ/);
    
    console.log('✅ Supabase credentials fetched successfully');
  }, 10000);

  test('should fetch GitHub credentials from Doppler', async () => {
    const result = await getGitHubCredentials(dopplerConfig);
    // console.log(result)
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.appId).toBeDefined();
    expect(result.data?.clientId).toBeDefined();
    expect(result.data?.clientSecret).toBeDefined();
    expect(result.data?.privateKey).toBeDefined();
    
    // Validate GitHub App ID format (should be numeric)
    expect(result.data?.appId).toMatch(/^\d+$/);
    
    // Validate client ID format
    expect(result.data?.clientId).toMatch(/^Iv\d\./);
    
    // Validate private key format
    expect(result.data?.privateKey).toContain('-----BEGIN RSA PRIVATE KEY-----');
    expect(result.data?.privateKey).toContain('-----END RSA PRIVATE KEY-----');
    
    console.log('✅ GitHub credentials fetched successfully');
  }, 10000);

  test('should handle invalid Doppler token', async () => {
    const invalidConfig = {
      ...dopplerConfig,
      token: 'invalid-token'
    };
    
    const result = await getSupabaseCredentials(invalidConfig);
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('Failed to get Supabase credentials');
    
    console.log('✅ Invalid token handled correctly');
  }, 10000);
});
