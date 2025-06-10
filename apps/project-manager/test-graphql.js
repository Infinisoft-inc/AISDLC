#!/usr/bin/env node

// Load environment variables
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '.env');

config({ path: envPath });

console.log('DOPPLER_TOKEN loaded:', !!process.env.DOPPLER_TOKEN);

// Test GraphQL functionality
async function testGraphQL() {
  try {
    const { createGitHubSetup } = await import('@brainstack/integration-service');
    const { createAITeammateField } = await import('@brainstack/github-service');

    console.log('Testing GitHub setup...');
    const githubSetupResult = await createGitHubSetup(process.env.DOPPLER_TOKEN, 'Infinisoft-inc');
    
    console.log('GitHub setup result:', {
      success: githubSetupResult.success,
      hasData: !!githubSetupResult.data,
      error: githubSetupResult.error
    });

    if (githubSetupResult.success && githubSetupResult.data) {
      const octokit = githubSetupResult.data;
      console.log('Octokit methods:', Object.keys(octokit));
      console.log('Has graphql:', typeof octokit.graphql);
      console.log('Has rest:', typeof octokit.rest);

      if (octokit.graphql) {
        console.log('Testing simple GraphQL query...');
        const result = await octokit.graphql('query { viewer { login } }');
        console.log('GraphQL test result:', result);

        // Test field creation on project 98
        console.log('Testing AI Teammate field creation...');
        const fieldResult = await createAITeammateField(octokit, 'PVT_kwHOBhHJBs4AqJJOzgKJJw');
        console.log('Field creation result:', {
          success: fieldResult.success,
          error: fieldResult.error,
          fieldName: fieldResult.data?.name
        });
      }
    }
  } catch (error) {
    console.error('Test error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testGraphQL();
