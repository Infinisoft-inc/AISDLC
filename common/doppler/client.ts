/**
 * Reusable Doppler Client for AI-SDLC App
 * Can be used across the entire application
 */

export interface DopplerConfig {
  project: string;
  config: string;
  accessToken?: string;
}

/**
 * Get a secret from Doppler with fallback to environment variables
 */
export async function getSecret(name: string): Promise<string> {
  try {
    // Try Doppler first if available
    if (process.env.DOPPLER_TOKEN) {
      const DopplerSDK = (await import('@dopplerhq/node-sdk')).default;
      const doppler = new DopplerSDK({
        accessToken: process.env.DOPPLER_TOKEN
      });
      
      const res = await doppler.secrets.get('ai-sdlc', 'prd', name);
      return res.value.computed;
    }
  } catch (error) {
    console.warn(`⚠️ Doppler failed for ${name}, using .env fallback:`, error);
  }
  
  // Fallback to environment variables
  return process.env[name] || '';
}

/**
 * Update a secret in Doppler
 */
export async function updateSecret(name: string, value: string): Promise<void> {
  try {
    if (!process.env.DOPPLER_TOKEN) {
      throw new Error('DOPPLER_TOKEN not available');
    }

    const DopplerSDK = (await import('@dopplerhq/node-sdk')).default;
    const doppler = new DopplerSDK({
      accessToken: process.env.DOPPLER_TOKEN
    });
    
    await doppler.secrets.update({
      project: 'ai-sdlc',
      config: 'prd',
      secrets: {
        [name]: value
      }
    });
    console.log(`✅ Updated ${name} in Doppler`);
  } catch (error) {
    console.error(`❌ Failed to update ${name}:`, error);
    throw error;
  }
}
