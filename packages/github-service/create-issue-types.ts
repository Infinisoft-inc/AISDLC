/**
 * Create real GitHub issue types for the organization
 */

import './tests/setup.js';
import { createGitHubSetup } from '@brainstack/integration-service';

async function createIssueTypes() {
  try {
    console.log('🚀 Creating real GitHub issue types for organization...');

    const result = await createGitHubSetup(
      process.env.DOPPLER_TOKEN!,
      'Infinisoft-inc'
    );

    if (!result.success) {
      throw new Error(`Failed to setup GitHub client: ${result.error}`);
    }

    const octokit = result.data;
    const org = 'Infinisoft-inc';

    // Define the issue types we want to create
    const issueTypes = [
      {
        name: 'Epic',
        description: 'Large feature or initiative spanning multiple features',
        color: 'purple',
        is_enabled: true
      },
      {
        name: 'Feature',
        description: 'New feature or enhancement',
        color: 'green',
        is_enabled: true
      },
      {
        name: 'Task',
        description: 'Specific task or work item',
        color: 'blue',
        is_enabled: true
      },
      {
        name: 'Bug',
        description: 'Bug or issue to fix',
        color: 'red',
        is_enabled: true
      },
      {
        name: 'Enhancement',
        description: 'Improvement to existing functionality',
        color: 'yellow',
        is_enabled: true
      }
    ];

    console.log('\n📋 Creating issue types...');

    const createdTypes: any[] = [];

    for (const issueType of issueTypes) {
      try {
        console.log(`   🔧 Creating issue type: ${issueType.name}`);
        
        const response = await octokit.request('POST /orgs/{org}/issue-types', {
          org,
          name: issueType.name,
          description: issueType.description,
          color: issueType.color,
          is_enabled: issueType.is_enabled,
          headers: {
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });

        console.log(`   ✅ Created: ${issueType.name} (ID: ${response.data.id})`);
        createdTypes.push({
          name: issueType.name,
          id: response.data.id,
          node_id: response.data.node_id
        });

      } catch (error: any) {
        if (error.status === 422) {
          console.log(`   ⚠️ Issue type '${issueType.name}' already exists or validation failed`);
          
          // Try to get existing issue types to find the ID
          try {
            const existingTypes = await octokit.request('GET /orgs/{org}/issue-types', {
              org,
              headers: {
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
              }
            });

            const existingType = existingTypes.data.find((t: any) => t.name === issueType.name);
            if (existingType) {
              console.log(`   ✅ Found existing: ${issueType.name} (ID: ${existingType.id})`);
              createdTypes.push({
                name: issueType.name,
                id: existingType.id,
                node_id: existingType.node_id
              });
            }
          } catch (getError) {
            console.log(`   ❌ Could not get existing issue types: ${getError.message}`);
          }
        } else {
          console.log(`   ❌ Error creating ${issueType.name}: ${error.message}`);
        }
      }
    }

    // List all issue types for the organization
    console.log('\n📋 Listing all organization issue types...');
    try {
      const allTypes = await octokit.request('GET /orgs/{org}/issue-types', {
        org,
        headers: {
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      console.log(`   ✅ Found ${allTypes.data.length} issue types:`);
      allTypes.data.forEach((type: any) => {
        console.log(`      📋 ${type.name} (ID: ${type.id}, Enabled: ${type.is_enabled})`);
      });

      return allTypes.data;
    } catch (error: any) {
      console.log(`   ❌ Error listing issue types: ${error.message}`);
      return createdTypes;
    }

  } catch (error: any) {
    console.error('❌ Failed to create issue types:', error.message);
    
    // Check if the organization supports issue types
    if (error.status === 404) {
      console.log('\n💡 This might be because:');
      console.log('   - Issue types are not available for this organization plan');
      console.log('   - Issue types require GitHub Enterprise or specific plan');
      console.log('   - The organization needs to enable issue types feature');
    }
    
    throw error;
  }
}

// Run the script
createIssueTypes()
  .then((types) => {
    console.log('\n✅ Issue types setup completed successfully!');
    if (types && types.length > 0) {
      console.log(`📊 Created/Found ${types.length} issue types`);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Issue types setup failed:', error.message);
    process.exit(1);
  });
