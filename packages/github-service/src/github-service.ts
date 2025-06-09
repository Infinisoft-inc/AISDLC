// Main GitHub service functions with AI-SDLC hierarchy support
import { createOctokitForInstallation } from './producer/github/octokit.js';
import { getFallbackInstallationId } from './common/doppler/github-secrets.js';
import type { RepositoryData, IssueData } from './types.js';

// Legacy compatibility function
async function createAuthenticatedOctokit(installationId?: number) {
  if (installationId) {
    return createOctokitForInstallation(installationId);
  }

  // Fallback to default installation ID
  const fallbackId = await getFallbackInstallationId();
  return createOctokitForInstallation(parseInt(fallbackId));
}

// Create a new repository
export async function createRepository(
  repoData: RepositoryData,
  installationId?: number
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log(`🏗️ Creating repository: ${repoData.name}`);

    const octokit = await createAuthenticatedOctokit(installationId);

    // Create repository for the authenticated user/organization
    // The GitHub App will automatically determine the correct context
    const response = await octokit.rest.repos.createForAuthenticatedUser({
      name: repoData.name,
      description: repoData.description || '',
      private: repoData.private || false,
      auto_init: true,
      license_template: 'mit',
    });

    console.log(`✅ Repository created: ${response.data.html_url}`);

    // Wait for GitHub to fully initialize the repository
    console.log(`⏳ Waiting for repository initialization...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log(`✅ Repository ready for content`);

    return {
      success: true,
      data: {
        id: response.data.id,
        name: response.data.name,
        full_name: response.data.full_name,
        html_url: response.data.html_url,
        clone_url: response.data.clone_url,
        ssh_url: response.data.ssh_url,
        private: response.data.private,
        default_branch: response.data.default_branch,
      }
    };
  } catch (error: any) {
    console.error('❌ Failed to create repository:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Create an EPIC issue (top-level parent)
export async function createEpic(
  owner: string,
  repo: string,
  epicData: IssueData,
  installationId?: number
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log(`📋 Creating EPIC: ${epicData.title}`);

    const octokit = await createAuthenticatedOctokit(installationId);

    // Ensure EPIC has proper labels
    const labels = [...(epicData.labels || [])];
    if (!labels.includes('epic')) {
      labels.push('epic');
    }

    const response = await octokit.rest.issues.create({
      owner,
      repo,
      title: epicData.title,
      body: epicData.body || '',
      labels,
      assignees: epicData.assignees || [],
    });

    // Set issue type to Epic using GraphQL API
    try {
      const { getOrganizationIssueTypes } = await import('./github-service.js');
      const issueTypesResult = await getOrganizationIssueTypes(owner, installationId);

      if (issueTypesResult.success && issueTypesResult.data.Epic) {
        const mutation = `
          mutation UpdateIssue($issueId: ID!, $issueTypeId: ID!) {
            updateIssue(input: {
              id: $issueId
              issueTypeId: $issueTypeId
            }) {
              issue {
                id
                number
                issueType {
                  name
                }
              }
            }
          }
        `;

        await octokit.graphql({
          query: mutation,
          issueId: response.data.node_id,
          issueTypeId: issueTypesResult.data.Epic,
          headers: {
            'GraphQL-Features': 'issue_types'
          }
        });

        console.log(`✅ EPIC issue type set: Epic`);
      } else {
        console.warn(`⚠️ Epic issue type not found in organization`);
      }
    } catch (typeError: any) {
      console.warn(`⚠️ Could not set issue type: ${typeError.message}`);
    }

    // Create linked branch for the epic
    const branchName = generateBranchName('epic', { title: response.data.title });
    const branchResult = await createLinkedBranch(owner, repo, response.data.number, branchName, installationId);

    let linkedBranch;
    if (branchResult.success) {
      console.log(`✅ Linked branch created: ${branchResult.data.branchName}`);
      linkedBranch = branchResult.data;
    } else {
      console.warn(`⚠️ Failed to create linked branch: ${branchResult.error}`);
    }

    console.log(`✅ EPIC created: ${response.data.html_url}`);

    return {
      success: true,
      data: {
        id: response.data.id,
        number: response.data.number,
        title: response.data.title,
        html_url: response.data.html_url,
        state: response.data.state,
        linkedBranch,
      }
    };
  } catch (error: any) {
    console.error('❌ Failed to create EPIC:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Create a FEATURE issue (child of EPIC)
export async function createFeature(
  owner: string,
  repo: string,
  featureData: IssueData,
  epicNumber: number,
  installationId?: number
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log(`🎯 Creating FEATURE: ${featureData.title}`);

    const octokit = await createAuthenticatedOctokit(installationId);

    // Ensure FEATURE has proper labels
    const labels = [...(featureData.labels || [])];
    if (!labels.includes('feature')) {
      labels.push('feature');
    }

    // Create the feature issue
    const response = await octokit.rest.issues.create({
      owner,
      repo,
      title: featureData.title,
      body: featureData.body || '',
      labels,
      assignees: featureData.assignees || [],
    });

    // Set issue type to Feature using GraphQL API
    try {
      const { getOrganizationIssueTypes } = await import('./github-service.js');
      const issueTypesResult = await getOrganizationIssueTypes(owner, installationId);

      if (issueTypesResult.success && issueTypesResult.data.Feature) {
        const mutation = `
          mutation UpdateIssue($issueId: ID!, $issueTypeId: ID!) {
            updateIssue(input: {
              id: $issueId
              issueTypeId: $issueTypeId
            }) {
              issue {
                id
                number
                issueType {
                  name
                }
              }
            }
          }
        `;

        await octokit.graphql({
          query: mutation,
          issueId: response.data.node_id,
          issueTypeId: issueTypesResult.data.Feature,
          headers: {
            'GraphQL-Features': 'issue_types'
          }
        });

        console.log(`✅ FEATURE issue type set: Feature`);
      } else {
        console.warn(`⚠️ Feature issue type not found in organization`);
      }
    } catch (typeError: any) {
      console.warn(`⚠️ Could not set issue type: ${typeError.message}`);
    }

    // Link feature to EPIC as sub-issue
    const linkResult = await addSubIssue(owner, repo, epicNumber, response.data.number, installationId);

    if (!linkResult.success) {
      console.warn(`⚠️ Feature created but failed to link to EPIC: ${linkResult.error}`);
    }

    // Create linked branch for the feature
    const branchName = generateBranchName('feature', { title: response.data.title });
    const branchResult = await createLinkedBranch(owner, repo, response.data.number, branchName, installationId);

    let linkedBranch;
    if (branchResult.success) {
      console.log(`✅ Linked branch created: ${branchResult.data.branchName}`);
      linkedBranch = branchResult.data;
    } else {
      console.warn(`⚠️ Failed to create linked branch: ${branchResult.error}`);
    }

    console.log(`✅ FEATURE created and linked to EPIC: ${response.data.html_url}`);

    return {
      success: true,
      data: {
        id: response.data.id,
        number: response.data.number,
        title: response.data.title,
        html_url: response.data.html_url,
        state: response.data.state,
        parent_epic: epicNumber,
        linkedBranch,
      }
    };
  } catch (error: any) {
    console.error('❌ Failed to create FEATURE:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Create a TASK issue (child of FEATURE)
export async function createTask(
  owner: string,
  repo: string,
  taskData: IssueData,
  featureNumber: number,
  installationId?: number
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log(`⚡ Creating TASK: ${taskData.title}`);

    const octokit = await createAuthenticatedOctokit(installationId);

    // Ensure TASK has proper labels
    const labels = [...(taskData.labels || [])];
    if (!labels.includes('task')) {
      labels.push('task');
    }

    // Create the task issue
    const response = await octokit.rest.issues.create({
      owner,
      repo,
      title: taskData.title,
      body: taskData.body || '',
      labels,
      assignees: taskData.assignees || [],
    });

    // Set issue type to Task using GraphQL API
    try {
      const { getOrganizationIssueTypes } = await import('./github-service.js');
      const issueTypesResult = await getOrganizationIssueTypes(owner, installationId);

      if (issueTypesResult.success && issueTypesResult.data.Task) {
        const mutation = `
          mutation UpdateIssue($issueId: ID!, $issueTypeId: ID!) {
            updateIssue(input: {
              id: $issueId
              issueTypeId: $issueTypeId
            }) {
              issue {
                id
                number
                issueType {
                  name
                }
              }
            }
          }
        `;

        await octokit.graphql({
          query: mutation,
          issueId: response.data.node_id,
          issueTypeId: issueTypesResult.data.Task,
          headers: {
            'GraphQL-Features': 'issue_types'
          }
        });

        console.log(`✅ TASK issue type set: Task`);
      } else {
        console.warn(`⚠️ Task issue type not found in organization`);
      }
    } catch (typeError: any) {
      console.warn(`⚠️ Could not set issue type: ${typeError.message}`);
    }

    // Link task to FEATURE as sub-issue
    const linkResult = await addSubIssue(owner, repo, featureNumber, response.data.number, installationId);

    if (!linkResult.success) {
      console.warn(`⚠️ Task created but failed to link to FEATURE: ${linkResult.error}`);
    }

    // Create linked branch for the task
    const branchName = generateBranchName('task', taskData);
    const branchResult = await createLinkedBranch(owner, repo, response.data.number, branchName, installationId);

    let linkedBranch;
    if (branchResult.success) {
      console.log(`✅ Linked branch created: ${branchResult.data.branchName}`);
      linkedBranch = branchResult.data;
    } else {
      console.warn(`⚠️ Failed to create linked branch: ${branchResult.error}`);
    }

    console.log(`✅ TASK created and linked to FEATURE: ${response.data.html_url}`);

    return {
      success: true,
      data: {
        id: response.data.id,
        number: response.data.number,
        title: response.data.title,
        html_url: response.data.html_url,
        state: response.data.state,
        parent_feature: featureNumber,
        linkedBranch,
      }
    };
  } catch (error: any) {
    console.error('❌ Failed to create TASK:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Add sub-issue relationship using GitHub's real sub-issue API
export async function addSubIssue(
  owner: string,
  repo: string,
  parentIssueNumber: number,
  childIssueNumber: number,
  installationId?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`🔗 Creating real sub-issue relationship: #${parentIssueNumber} → #${childIssueNumber}`);

    const octokit = await createAuthenticatedOctokit(installationId);

    try {
      // Get the child issue to get its internal ID
      const childIssue = await octokit.rest.issues.get({
        owner,
        repo,
        issue_number: childIssueNumber,
      });

      // Use the real GitHub sub-issue API
      await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/sub_issues', {
        owner,
        repo,
        issue_number: parentIssueNumber,
        sub_issue_id: childIssue.data.id,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      console.log(`✅ Real sub-issue relationship created: #${parentIssueNumber} → #${childIssueNumber}`);
      return { success: true };
    } catch (apiError: any) {
      // If the real API fails, fall back to comment-based linking
      console.log(`⚠️ Real sub-issue API not available, using comment fallback`);

      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: parentIssueNumber,
        body: `🔗 **Sub-issue:** #${childIssueNumber}`,
      });

      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: childIssueNumber,
        body: `🔗 **Parent issue:** #${parentIssueNumber}`,
      });

      console.log(`✅ Fallback: Added comments linking #${childIssueNumber} to #${parentIssueNumber}`);
      return { success: true };
    }
  } catch (error: any) {
    console.error('❌ Failed to create issue relationship:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Create a milestone
export async function createMilestone(
  owner: string,
  repo: string,
  title: string,
  description?: string,
  installationId?: number
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log(`🎯 Creating milestone: ${title}`);
    
    const octokit = await createAuthenticatedOctokit(installationId);
    
    const response = await octokit.rest.issues.createMilestone({
      owner,
      repo,
      title,
      description: description || '',
    });
    
    console.log(`✅ Milestone created: ${response.data.title}`);
    
    return {
      success: true,
      data: {
        id: response.data.id,
        number: response.data.number,
        title: response.data.title,
        html_url: response.data.html_url,
      }
    };
  } catch (error: any) {
    console.error('❌ Failed to create milestone:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// List repositories for the authenticated installation
export async function listRepositories(
  installationId?: number
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    console.log('📋 Listing repositories...');
    
    const octokit = await createAuthenticatedOctokit(installationId);
    
    const response = await octokit.rest.apps.listReposAccessibleToInstallation({
      per_page: 100,
    });
    
    const repos = response.data.repositories.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      html_url: repo.html_url,
      description: repo.description,
      private: repo.private,
      updated_at: repo.updated_at,
    }));
    
    console.log(`✅ Found ${repos.length} repositories`);
    
    return {
      success: true,
      data: repos
    };
  } catch (error: any) {
    console.error('❌ Failed to list repositories:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Get repository information
export async function getRepository(
  owner: string,
  repo: string,
  installationId?: number
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log(`📖 Getting repository: ${owner}/${repo}`);

    const octokit = await createAuthenticatedOctokit(installationId);

    const response = await octokit.rest.repos.get({
      owner,
      repo,
    });

    console.log(`✅ Repository found: ${response.data.html_url}`);

    return {
      success: true,
      data: {
        id: response.data.id,
        name: response.data.name,
        full_name: response.data.full_name,
        html_url: response.data.html_url,
        description: response.data.description,
        private: response.data.private,
        default_branch: response.data.default_branch,
      }
    };
  } catch (error: any) {
    console.error('❌ Failed to get repository:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Get organization issue types with their GraphQL node IDs
export async function getOrganizationIssueTypes(
  org: string,
  installationId?: number
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const octokit = await createAuthenticatedOctokit(installationId);

    // Use GraphQL to get issue types with proper node IDs
    const query = `
      query GetOrganizationIssueTypes($org: String!) {
        organization(login: $org) {
          issueTypes(first: 10) {
            nodes {
              id
              name
              description
              color
            }
          }
        }
      }
    `;

    const response = await octokit.graphql(query, {
      org,
      headers: {
        'GraphQL-Features': 'issue_types'
      }
    });

    const issueTypes = (response as any).organization.issueTypes.nodes.reduce((acc: any, type: any) => {
      acc[type.name] = type.id;
      return acc;
    }, {});

    console.log(`✅ Found issue types:`, Object.keys(issueTypes));

    return {
      success: true,
      data: issueTypes
    };
  } catch (error: any) {
    console.warn(`⚠️ Could not get issue types via GraphQL: ${error.message}`);

    // Fallback to REST API
    try {
      const restOctokit = await createAuthenticatedOctokit(installationId);
      const response = await restOctokit.request('GET /orgs/{org}/issue-types', {
        org,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      const issueTypes = response.data.reduce((acc: any, type: any) => {
        acc[type.name] = type.id;
        return acc;
      }, {});

      return {
        success: true,
        data: issueTypes
      };
    } catch (restError: any) {
      return {
        success: false,
        error: restError.message
      };
    }
  }
}

// Create organization issue types (Epic, Feature, Task)
export async function createOrganizationIssueTypes(
  org: string,
  installationId?: number
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log(`🏷️ Creating organization issue types for: ${org}`);

    const octokit = await createAuthenticatedOctokit(installationId);

    const issueTypes = [
      {
        name: 'Epic',
        description: 'Large feature or initiative spanning multiple sprints',
        color: 'purple' as const,
        is_enabled: true
      },
      {
        name: 'Feature',
        description: 'A new feature or enhancement',
        color: 'blue' as const,
        is_enabled: true
      },
      {
        name: 'Task',
        description: 'A specific task or work item',
        color: 'green' as const,
        is_enabled: true
      }
    ];

    const results = [];

    for (const issueType of issueTypes) {
      try {
        const response = await octokit.request('POST /orgs/{org}/issue-types', {
          org,
          name: issueType.name,
          description: issueType.description,
          is_enabled: issueType.is_enabled,
          color: issueType.color,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });

        results.push({
          name: issueType.name,
          success: true,
          data: response.data
        });

        console.log(`✅ Issue type created: ${issueType.name} (${issueType.color})`);
      } catch (error: any) {
        if (error.status === 422 && error.message.includes('already exists')) {
          console.log(`ℹ️ Issue type already exists: ${issueType.name}`);
          results.push({
            name: issueType.name,
            success: true,
            data: { message: 'Already exists' }
          });
        } else {
          console.error(`❌ Failed to create issue type ${issueType.name}:`, error.message);
          results.push({
            name: issueType.name,
            success: false,
            error: error.message
          });
        }
      }
    }

    console.log(`✅ Organization issue types setup complete`);

    return {
      success: true,
      data: results
    };
  } catch (error: any) {
    console.error('❌ Failed to create organization issue types:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Create a GitHub Project (v2) for the repository
export async function createProject(
  owner: string,
  title: string,
  description?: string,
  installationId?: number
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log(`📊 Creating GitHub Project: ${title}`);

    const octokit = await createAuthenticatedOctokit(installationId);

    // Create project using GraphQL API (Projects v2)
    const mutation = `
      mutation CreateProject($ownerId: ID!, $title: String!) {
        createProjectV2(input: {
          ownerId: $ownerId
          title: $title
        }) {
          projectV2 {
            id
            number
            title
            url
            shortDescription
          }
        }
      }
    `;

    // First get the organization ID
    const orgResponse = await octokit.rest.orgs.get({ org: owner });
    const ownerId = orgResponse.data.node_id;

    const response = await octokit.graphql(mutation, {
      ownerId,
      title,
    });

    const project = (response as any).createProjectV2.projectV2;

    console.log(`✅ Project created: ${project.url}`);

    return {
      success: true,
      data: {
        id: project.id,
        number: project.number,
        title: project.title,
        url: project.url,
        description: project.shortDescription,
      }
    };
  } catch (error: any) {
    console.error('❌ Failed to create project:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Add issue to project with custom fields
export async function addIssueToProject(
  projectId: string,
  owner: string,
  repo: string,
  issueNumber: number,
  issueType: 'epic' | 'feature' | 'task',
  parentIssueNumber?: number,
  installationId?: number
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log(`🔗 Adding issue #${issueNumber} to project with type: ${issueType}`);

    const octokit = await createAuthenticatedOctokit(installationId);

    // First get the issue to get its node_id
    const issueResponse = await octokit.rest.issues.get({
      owner,
      repo,
      issue_number: issueNumber,
    });

    const issueNodeId = issueResponse.data.node_id;

    // Add item to project
    const addItemMutation = `
      mutation AddProjectV2ItemById($projectId: ID!, $contentId: ID!) {
        addProjectV2ItemById(input: {
          projectId: $projectId
          contentId: $contentId
        }) {
          item {
            id
          }
        }
      }
    `;

    const addResponse = await octokit.graphql(addItemMutation, {
      projectId,
      contentId: issueNodeId,
    });

    const itemId = (addResponse as any).addProjectV2ItemById.item.id;

    console.log(`✅ Issue #${issueNumber} added to project with item ID: ${itemId}`);

    return {
      success: true,
      data: {
        itemId,
        issueNumber,
        issueType,
        parentIssueNumber,
      }
    };
  } catch (error: any) {
    console.error('❌ Failed to add issue to project:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Setup GitHub issue templates in repository
export async function setupIssueTemplates(
  owner: string,
  repo: string,
  installationId?: number
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log(`📋 Setting up GitHub issue templates for: ${owner}/${repo}`);

    const octokit = await createAuthenticatedOctokit(installationId);

    // Read template files
    const fs = await import('fs/promises');
    const path = await import('path');

    const templateDir = path.join(process.cwd(), '../..', 'templates', 'github-integration');

    const templates = [
      {
        filename: 'epic-issue.md',
        path: '.github/ISSUE_TEMPLATE/epic-issue.md'
      },
      {
        filename: 'feature-issue.md',
        path: '.github/ISSUE_TEMPLATE/feature-issue.md'
      },
      {
        filename: 'task-issue.md',
        path: '.github/ISSUE_TEMPLATE/task-issue.md'
      }
    ];

    const results = [];

    for (const template of templates) {
      try {
        const templateContent = await fs.readFile(
          path.join(templateDir, template.filename),
          'utf-8'
        );

        // Create or update the template file in the repository
        const response = await octokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: template.path,
          message: `Add ${template.filename} issue template`,
          content: Buffer.from(templateContent).toString('base64'),
        });

        results.push({
          template: template.filename,
          success: true,
          path: template.path,
          sha: response.data.content?.sha
        });

        console.log(`✅ Template created: ${template.path}`);
      } catch (error: any) {
        console.error(`❌ Failed to create template ${template.filename}:`, error.message);
        results.push({
          template: template.filename,
          success: false,
          error: error.message
        });
      }
    }

    console.log(`✅ Issue templates setup complete`);

    return {
      success: true,
      data: results
    };
  } catch (error: any) {
    console.error('❌ Failed to setup issue templates:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Create Epic using template with real data
export async function createEpicFromTemplate(
  owner: string,
  repo: string,
  epicData: {
    domainName: string;
    description: string;
    businessValue: string;
    srsReference?: string;
    addReference?: string;
    inScope: string[];
    outOfScope: string[];
    successCriteria: string[];
  },
  installationId?: number
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log(`📋 Creating EPIC from template: ${epicData.domainName}`);

    const title = `[EPIC] ${epicData.domainName} - ${epicData.description}`;

    const body = `# Epic: ${epicData.domainName}

## Domain Description
${epicData.description}

## Business Value
${epicData.businessValue}

## Documentation Links
- **SRS Reference:** ${epicData.srsReference || '[Link to SRS domain section]'}
- **ADD Reference:** ${epicData.addReference || '[Link to ADD architectural design]'}

## Scope
**In Scope:**
${epicData.inScope.map(item => `- ${item}`).join('\n')}

**Out of Scope:**
${epicData.outOfScope.map(item => `- ${item}`).join('\n')}

## Success Criteria
${epicData.successCriteria.map(criteria => `- [ ] ${criteria}`).join('\n')}`;

    const labels = ['epic', `domain:${epicData.domainName.toLowerCase().replace(/\s+/g, '-')}`];

    const result = await createEpic(owner, repo, {
      title,
      body,
      labels
    }, installationId);

    if (result.success) {
      // Create linked branch for the epic
      const branchName = generateBranchName('epic', epicData);
      const branchResult = await createLinkedBranch(owner, repo, result.data.number, branchName, installationId);

      if (branchResult.success) {
        console.log(`✅ Linked branch created: ${branchResult.data.branchName}`);
        result.data.linkedBranch = branchResult.data;
      } else {
        console.warn(`⚠️ Failed to create linked branch: ${branchResult.error}`);
      }
    }

    console.log(`✅ EPIC created from template: ${result.data?.html_url}`);

    return result;
  } catch (error: any) {
    console.error('❌ Failed to create EPIC from template:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Create Feature using template with real data
export async function createFeatureFromTemplate(
  owner: string,
  repo: string,
  featureData: {
    frReference: string;
    domain: string;
    description: string;
    userRole: string;
    functionality: string;
    businessBenefit: string;
    frsReference?: string;
    implementationPlanReference?: string;
    acceptanceCriteria: Array<{given: string; when: string; then: string}>;
  },
  epicNumber: number,
  installationId?: number
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log(`🎯 Creating FEATURE from template: ${featureData.frReference}`);

    const title = `[FEATURE] ${featureData.frReference} - ${featureData.description}`;

    const body = `# Feature: ${featureData.frReference}

## Functional Requirement Reference
**FR Reference:** ${featureData.frReference} - ${featureData.frsReference || '[Link to FRS document]'}
**Domain:** ${featureData.domain}

## Feature Description
${featureData.description}

## User Story
**As a** ${featureData.userRole}
**I want** ${featureData.functionality}
**So that** ${featureData.businessBenefit}

## Documentation Links
- **FRS Reference:** ${featureData.frsReference || '[Link to FRS document for this functional requirement]'}
- **Implementation Plan Reference:** ${featureData.implementationPlanReference || '[Link to Implementation Plan]'}

## Acceptance Criteria
${featureData.acceptanceCriteria.map(ac => `- [ ] **Given** ${ac.given} **When** ${ac.when} **Then** ${ac.then}`).join('\n')}

## Definition of Done
- [ ] All acceptance criteria are met
- [ ] All child task issues are completed
- [ ] Code review is complete
- [ ] Feature is deployed and working

---

**Note:** Task issues will be created as child issues of this feature issue using GitHub's parent-child relationship. Each task will reference this feature as its parent and will be automatically linked in the GitHub interface.`;

    const labels = ['feature'];

    const result = await createFeature(owner, repo, {
      title,
      body,
      labels
    }, epicNumber, installationId);

    if (result.success) {
      // Create linked branch for the feature
      const branchName = generateBranchName('feature', featureData);
      const branchResult = await createLinkedBranch(owner, repo, result.data.number, branchName, installationId);

      if (branchResult.success) {
        console.log(`✅ Linked branch created: ${branchResult.data.branchName}`);
        result.data.linkedBranch = branchResult.data;
      } else {
        console.warn(`⚠️ Failed to create linked branch: ${branchResult.error}`);
      }
    }

    console.log(`✅ FEATURE created from template: ${result.data?.html_url}`);

    return result;
  } catch (error: any) {
    console.error('❌ Failed to create FEATURE from template:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Create a linked branch for an issue
export async function createLinkedBranch(
  owner: string,
  repo: string,
  issueNumber: number,
  branchName: string,
  installationId?: number
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log(`🌿 Creating linked branch: ${branchName} for issue #${issueNumber}`);

    const octokit = await createAuthenticatedOctokit(installationId);

    // First get the issue to get its node_id
    const issueResponse = await octokit.rest.issues.get({
      owner,
      repo,
      issue_number: issueNumber,
    });

    const issueNodeId = issueResponse.data.node_id;

    // Get the repository to get its node_id and default branch
    const repoResponse = await octokit.rest.repos.get({
      owner,
      repo,
    });

    const repoNodeId = repoResponse.data.node_id;
    const defaultBranch = repoResponse.data.default_branch;

    // Get the default branch commit SHA
    const branchResponse = await octokit.rest.repos.getBranch({
      owner,
      repo,
      branch: defaultBranch,
    });

    const commitSha = branchResponse.data.commit.sha;

    // Use GraphQL mutation to create linked branch
    const mutation = `
      mutation CreateLinkedBranch($repositoryId: ID!, $issueId: ID!, $name: String!, $oid: GitObjectID!) {
        createLinkedBranch(input: {
          repositoryId: $repositoryId
          issueId: $issueId
          name: $name
          oid: $oid
        }) {
          linkedBranch {
            id
            ref {
              name
              target {
                oid
              }
            }
          }
          issue {
            number
            title
          }
        }
      }
    `;

    const response = await octokit.graphql(mutation, {
      repositoryId: repoNodeId,
      issueId: issueNodeId,
      name: branchName,
      oid: commitSha,
    });

    const linkedBranch = (response as any).createLinkedBranch.linkedBranch;

    console.log(`✅ Linked branch created: ${linkedBranch.ref.name}`);

    return {
      success: true,
      data: {
        branchName: linkedBranch.ref.name,
        branchId: linkedBranch.id,
        commitOid: linkedBranch.ref.target.oid,
        issueNumber,
      }
    };
  } catch (error: any) {
    console.error('❌ Failed to create linked branch:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Generate branch name based on issue type and data
export function generateBranchName(issueType: 'epic' | 'feature' | 'task', issueData: any): string {
  const sanitize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  switch (issueType) {
    case 'epic':
      return `epic/${sanitize(issueData.domainName || issueData.title)}`;
    case 'feature':
      return `feature/${sanitize(issueData.frReference || issueData.title)}`;
    case 'task':
      return `task/${sanitize(issueData.title.replace(/^\[TASK\]\s*/, ''))}`;
    default:
      return `issue/${sanitize(issueData.title)}`;
  }
}
