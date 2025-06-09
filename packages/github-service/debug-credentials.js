/**
 * Debug script to check credential loading
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load test environment variables
config({ path: resolve(__dirname, '.env.test') });

console.log('🔍 Debug: Environment Variables');
console.log('DOPPLER_TOKEN:', process.env.DOPPLER_TOKEN ? 'SET' : 'NOT SET');
console.log('TEST_ORGANIZATION:', process.env.TEST_ORGANIZATION);
console.log('TEST_REPOSITORY:', process.env.TEST_REPOSITORY);

// Try to import and use the integration service
try {
  console.log('\n🔍 Debug: Importing integration service...');
  const { getSupabaseCredentials } = await import('@brainstack/integration-service');
  
  console.log('✅ Integration service imported successfully');
  
  if (process.env.DOPPLER_TOKEN && process.env.DOPPLER_TOKEN !== 'your-test-doppler-token') {
    console.log('\n🔍 Debug: Testing GitHub setup...');

    const { createGitHubSetup } = await import('@brainstack/integration-service');
    const githubResult = await createGitHubSetup(process.env.DOPPLER_TOKEN, process.env.TEST_ORGANIZATION);

    console.log('GitHub setup result:', {
      success: githubResult.success,
      hasData: !!githubResult.data,
      error: githubResult.error
    });

    if (githubResult.success && githubResult.data) {
      console.log('\n🔍 Debug: Testing repository access...');
      const octokit = githubResult.data;

      try {
        // Check the installation token permissions
        console.log('\n🔍 Debug: Checking installation token...');
        const tokenResult = await octokit.rest.apps.checkToken({
          client_id: process.env.GITHUB_CLIENT_ID || 'unknown'
        });
        console.log('Token info:', {
          scopes: tokenResult.data.scopes,
          app: tokenResult.data.app?.name
        });
      } catch (error) {
        console.log('Token check failed (expected):', error.message);
      }

      try {
        // Get installation details
        const installationResult = await octokit.rest.apps.getInstallation({
          installation_id: 70009309 // Your installation ID
        });
        console.log('Installation details:', {
          permissions: installationResult.data.permissions,
          repositorySelection: installationResult.data.repository_selection
        });
      } catch (error) {
        console.log('Installation check failed:', error.message);
      }

      try {
        // Try to list repositories the app has access to
        const reposResult = await octokit.rest.apps.listReposAccessibleToInstallation();
        console.log('Accessible repositories:', reposResult.data.repositories.map(repo => repo.name));

        // Try to create an issue in the first accessible repository
        const testRepo = reposResult.data.repositories[0];
        if (testRepo) {
          console.log(`\n🔍 Debug: Testing issue creation in ${testRepo.name}...`);
          const issueResult = await octokit.rest.issues.create({
            owner: process.env.TEST_ORGANIZATION,
            repo: testRepo.name,
            title: '[TEST] Debug Issue Creation',
            body: 'This is a test issue to debug the GitHub service integration.'
          });
          console.log('Issue creation SUCCESS:', {
            number: issueResult.data.number,
            url: issueResult.data.html_url
          });
        }
      } catch (error) {
        console.error('Repository/Issue access error:', error.message);
        console.error('Error details:', error.response?.data || error);
      }
    }
  } else {
    console.log('⚠️ No real Doppler token found, skipping credential test');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}
