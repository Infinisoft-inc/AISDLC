#!/usr/bin/env node

// Load environment variables
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Octokit } from '@octokit/rest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '.env');

config({ path: envPath });

console.log('DOPPLER_TOKEN loaded:', !!process.env.DOPPLER_TOKEN);

// Test with a simple GitHub token (using the fallback from .env)
async function testSimpleGraphQL() {
  try {
    // Create a simple Octokit client with the GitHub token from .env
    const octokit = new Octokit({
      auth: process.env.GITHUB_CLIENT_SECRET, // Using this as a test token
      userAgent: 'AI-SDLC-Test/1.0.0'
    });

    console.log('Octokit created');
    console.log('Has graphql:', typeof octokit.graphql);
    console.log('Has rest:', typeof octokit.rest);

    if (octokit.graphql) {
      console.log('Testing simple GraphQL query...');
      const result = await octokit.graphql('query { viewer { login } }');
      console.log('GraphQL test result:', result);
    } else {
      console.log('No GraphQL method available');
    }
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testSimpleGraphQL();
