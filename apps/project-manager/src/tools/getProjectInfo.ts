import { createGitHubSetup } from '@brainstack/integration-service';
import { JordanMemoryManager } from '../memory.js';

export interface ProjectInfoQuery {
  organization: string;
  projectNumber?: number;
}

export interface ProjectInfoResult {
  success: boolean;
  data?: {
    projects: Array<{
      id: number;
      number: number;
      node_id: string;
      title: string;
      url: string;
      state: string;
    }>;
    summary: string;
  };
  error?: string;
}

/**
 * Get project information including correct node_id for GraphQL operations
 */
export async function getProjectInfo(
  data: ProjectInfoQuery,
  memory: JordanMemoryManager
): Promise<ProjectInfoResult> {
  const { organization, projectNumber } = data;

  try {
    console.log(`📋 Getting project info for organization: ${organization}`);
    
    // Get authenticated GitHub client
    const dopplerToken = process.env.DOPPLER_TOKEN;
    if (!dopplerToken) {
      throw new Error('DOPPLER_TOKEN environment variable not found');
    }
    
    const githubSetupResult = await createGitHubSetup(dopplerToken, organization);
    
    if (!githubSetupResult.success) {
      throw new Error(`GitHub setup failed: ${githubSetupResult.error}`);
    }

    const octokit = githubSetupResult.data;
    
    // Get organization projects using GraphQL (Projects V2)
    console.log(`🔍 Fetching Projects V2 for ${organization}...`);
    const query = `
      query($org: String!) {
        organization(login: $org) {
          projectsV2(first: 20) {
            nodes {
              id
              number
              title
              url
              closed
            }
          }
        }
      }
    `;

    const response = await octokit.graphql(query, { org: organization });
    const projectsData = (response as any).organization.projectsV2.nodes;

    const projects = projectsData.map((project: any) => ({
      id: project.number, // Using number as ID for display
      number: project.number,
      node_id: project.id, // This is the GraphQL node ID we need
      title: project.title,
      url: project.url,
      state: project.closed ? 'closed' : 'open'
    }));

    let summary = `## 📊 GitHub Projects for ${organization}

**Total Projects Found:** ${projects.length}

### 📋 Project List:
${projects.map((project: any, index: number) => `
${index + 1}. **${project.title}** (#${project.number})
   - **ID:** ${project.id}
   - **Node ID:** \`${project.node_id}\`
   - **URL:** ${project.url}
   - **State:** ${project.state}
`).join('')}

### 🎯 For GraphQL Operations:
Use the **Node ID** values above in GraphQL queries and mutations.

**Example Usage:**
\`\`\`graphql
query {
  node(id: "${projects[0]?.node_id || 'NODE_ID_HERE'}") {
    ... on ProjectV2 {
      title
      fields(first: 10) {
        nodes {
          ... on ProjectV2Field {
            id
            name
            dataType
          }
        }
      }
    }
  }
}
\`\`\``;

    if (projectNumber) {
      const specificProject = projects.find((p: any) => p.number === projectNumber);
      if (specificProject) {
        summary = `## 🎯 Project #${projectNumber} Information

**Title:** ${specificProject.title}
**ID:** ${specificProject.id}
**Node ID:** \`${specificProject.node_id}\`
**URL:** ${specificProject.url}
**State:** ${specificProject.state}

### 🔧 Ready for GraphQL Operations:
This Node ID can be used directly in GraphQL queries and mutations for field creation and management.`;
      } else {
        summary += `\n\n⚠️ **Project #${projectNumber} not found** in the list above.`;
      }
    }

    return {
      success: true,
      data: {
        projects,
        summary
      }
    };

  } catch (error) {
    console.error('Project info query error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
