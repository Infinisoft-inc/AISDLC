import { createGitHubSetup } from '@brainstack/integration-service';
import { JordanMemoryManager } from '../memory.js';

export interface GraphQLTestResult {
  success: boolean;
  data?: {
    hasGraphQL: boolean;
    viewerLogin?: string;
    projectFields?: any[];
    testResult: string;
  };
  error?: string;
}

/**
 * Test GraphQL functionality with the same setup as working Epic creation
 */
export async function testGraphQLFunctionality(
  projectId: string,
  memory: JordanMemoryManager
): Promise<GraphQLTestResult> {
  try {
    console.log('🧪 Testing GraphQL functionality...');
    
    // Use the same GitHub setup as working Epic creation
    const dopplerToken = process.env.DOPPLER_TOKEN;
    if (!dopplerToken) {
      throw new Error('DOPPLER_TOKEN environment variable not found');
    }
    
    const githubSetupResult = await createGitHubSetup(dopplerToken, "Infinisoft-inc");
    
    if (!githubSetupResult.success) {
      throw new Error(`GitHub setup failed: ${githubSetupResult.error}`);
    }

    const octokit = githubSetupResult.data;
    
    console.log('🔍 Checking Octokit client...');
    console.log('Has rest:', typeof octokit.rest);
    console.log('Has graphql:', typeof octokit.graphql);
    console.log('Octokit keys:', Object.keys(octokit));

    let testResult = '';
    let hasGraphQL = false;
    let viewerLogin;
    let projectFields;

    if (octokit.graphql) {
      hasGraphQL = true;
      testResult += '✅ GraphQL method exists\n';
      
      try {
        // Test 1: Simple viewer query
        console.log('🧪 Testing viewer query...');
        const viewerResult = await octokit.graphql('query { viewer { login } }');
        viewerLogin = (viewerResult as any).viewer.login;
        testResult += `✅ Viewer query successful: ${viewerLogin}\n`;
        
        // Test 2: Project fields query
        console.log('🧪 Testing project fields query...');
        const fieldsQuery = `
          query {
            node(id: "${projectId}") {
              ... on ProjectV2 {
                fields(first: 20) {
                  nodes {
                    ... on ProjectV2Field {
                      id
                      name
                      dataType
                    }
                    ... on ProjectV2SingleSelectField {
                      id
                      name
                      dataType
                      options {
                        id
                        name
                        color
                      }
                    }
                  }
                }
              }
            }
          }
        `;
        
        const fieldsResult = await octokit.graphql(fieldsQuery);
        projectFields = (fieldsResult as any).node.fields.nodes;
        testResult += `✅ Project fields query successful: ${projectFields.length} fields found\n`;
        
        // Test 3: Field creation mutation (with singleSelectOptions)
        console.log('🧪 Testing field creation mutation...');
        const createFieldMutation = `
          mutation {
            createProjectV2Field(input: {
              projectId: "${projectId}"
              dataType: SINGLE_SELECT
              name: "Test Field"
              singleSelectOptions: [
                {name: "Option 1", color: BLUE, description: "First test option"}
                {name: "Option 2", color: GREEN, description: "Second test option"}
              ]
            }) {
              projectV2Field {
                ... on ProjectV2Field {
                  id
                  name
                  dataType
                }
                ... on ProjectV2SingleSelectField {
                  id
                  name
                  dataType
                  options {
                    id
                    name
                    color
                  }
                }
              }
            }
          }
        `;
        
        const createResult = await octokit.graphql(createFieldMutation);
        const createdField = (createResult as any).createProjectV2Field.projectV2Field;
        testResult += `✅ Field creation successful: ${createdField.name} (${createdField.id})\n`;
        
      } catch (graphqlError: any) {
        testResult += `❌ GraphQL operation failed: ${graphqlError.message}\n`;
        console.error('GraphQL error:', graphqlError);
      }
    } else {
      testResult += '❌ GraphQL method not available\n';
    }

    return {
      success: true,
      data: {
        hasGraphQL,
        viewerLogin,
        projectFields,
        testResult
      }
    };

  } catch (error) {
    console.error('GraphQL test error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
