/**
 * Doppler Secret Management Integration
 * Project: ai-sdlc, Config: prd
 */
import DopplerSDK from '@dopplerhq/node-sdk';

class DopplerConfig {
  private doppler: any;
  private project = 'ai-sdlc';
  private configEnv = 'prd';

  constructor() {
    // Initialize Doppler SDK - only place we use process.env
    this.doppler = new DopplerSDK({
      accessToken: process.env.DOPPLER_TOKEN
    });
    console.log('✅ Doppler SDK initialized for ai-sdlc/prd');
  }

  async getSecret(name: string): Promise<string> {
    try {
      const res = await this.doppler.secrets.get(this.project, this.configEnv, name);
      console.log(`✅ Doppler: Retrieved ${name}`);
      return res.value.computed;
    } catch (error) {
      console.error(`❌ Doppler: Failed to get ${name}:`, error);
      throw error;
    }
  }

  async updateSecret(name: string, value: string): Promise<void> {
    try {
      // Correct format: single object with project, config, and secrets
      await this.doppler.secrets.update({
        project: this.project,
        config: this.configEnv,
        secrets: {
          [name]: value
        }
      });
      console.log(`✅ Doppler: Updated ${name}`);
    } catch (error) {
      console.error(`❌ Doppler: Failed to update ${name}:`, error);
      throw error;
    }
  }

  async getGitHubAppId(): Promise<string> {
    return this.getSecret('GITHUB_APP_ID');
  }

  async getGitHubPrivateKey(): Promise<string> {
    return this.getSecret('GITHUB_PRIVATE_KEY');
  }

  async getGitHubInstallationId(orgName?: string): Promise<string> {
    if (orgName) {
      const installationKey = `GITHUB_INSTALLATION_${orgName.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
      try {
        return await this.getSecret(installationKey);
      } catch {
        // Fallback to default installation
        return this.getSecret('GITHUB_INSTALLATION_ID');
      }
    }
    return this.getSecret('GITHUB_INSTALLATION_ID');
  }

  async getGitHubClientId(): Promise<string> {
    return this.getSecret('GITHUB_CLIENT_ID');
  }

  async getGitHubClientSecret(): Promise<string> {
    return this.getSecret('GITHUB_CLIENT_SECRET');
  }

  async setInstallationId(orgName: string, installationId: string): Promise<void> {
    const installationKey = `GITHUB_INSTALLATION_${orgName.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
    await this.updateSecret(installationKey, installationId);
  }
}

export const dopplerConfig = new DopplerConfig();