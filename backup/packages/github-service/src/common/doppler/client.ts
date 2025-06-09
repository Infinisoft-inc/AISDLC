/**
 * Reusable Doppler Client
 * Can be used across the entire AI-SDLC application
 */
import DopplerSDK from '@dopplerhq/node-sdk';

export interface DopplerConfig {
  project: string;
  config: string;
  accessToken?: string;
}

/**
 * Create a Doppler client instance
 */
export function createDopplerClient(config: DopplerConfig) {
  return new DopplerSDK({
    accessToken: config.accessToken || process.env.DOPPLER_TOKEN || 'dp.xx.yyy'
  });
}

/**
 * Get a secret from Doppler with fallback to environment variables
 */
export async function getSecret(
  client: any,
  project: string,
  config: string,
  name: string
): Promise<string> {
  try {
    const res = await client.secrets.get(project, config, name);
    return res.value.computed;
  } catch (error) {
    console.warn(`⚠️ Doppler failed for ${name}, using .env fallback:`, error);
    return process.env[name] || '';
  }
}

/**
 * Update a secret in Doppler
 */
export async function updateSecret(
  client: any,
  project: string,
  config: string,
  name: string,
  value: string
): Promise<void> {
  try {
    await client.secrets.update({
      project,
      config,
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
