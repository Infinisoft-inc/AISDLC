import { GitHubWorkflowService } from '../services/github-workflow.js';

/**
 * Tool for triggering GitHub workflow actions after document completion
 */
export class GitHubWorkflowTool {
  private workflowService: GitHubWorkflowService | null = null;

  constructor(workflowService?: GitHubWorkflowService) {
    this.workflowService = workflowService || null;
  }

  setWorkflowService(workflowService: GitHubWorkflowService) {
    this.workflowService = workflowService;
  }

  getSchema() {
    return {
      name: 'complete-document-workflow',
      description: 'Complete GitHub workflow after document creation: add review comment, update project status, and notify reviewers',
      inputSchema: {
        type: 'object',
        properties: {
          issueNumber: {
            type: 'number',
            description: 'GitHub issue number to update'
          },
          projectNumber: {
            type: 'number',
            description: 'GitHub project number for status updates'
          },
          documentUrl: {
            type: 'string',
            description: 'URL of the completed document'
          },
          documentTitle: {
            type: 'string',
            description: 'Title of the completed document'
          },
          reviewerMention: {
            type: 'string',
            description: 'GitHub username to mention for review (e.g., @mouimet-infinisoft)',
            default: '@mouimet-infinisoft'
          },
          taskDescription: {
            type: 'string',
            description: 'Optional description of the completed task'
          }
        },
        required: ['issueNumber', 'projectNumber', 'documentUrl', 'documentTitle']
      }
    };
  }

  async execute(args: {
    issueNumber: number;
    projectNumber: number;
    documentUrl: string;
    documentTitle: string;
    reviewerMention?: string;
    taskDescription?: string;
  }) {
    if (!this.workflowService) {
      return {
        content: [{
          type: "text",
          text: '❌ **GitHub Workflow Not Available**\n\nGitHub workflow service is not configured. This feature requires GitHub integration to be enabled.'
        }]
      };
    }

    try {
      const result = await this.workflowService.completeDocumentWorkflow({
        issueNumber: args.issueNumber,
        projectNumber: args.projectNumber,
        documentUrl: args.documentUrl,
        documentTitle: args.documentTitle,
        reviewerMention: args.reviewerMention || '@mouimet-infinisoft',
        taskDescription: args.taskDescription
      });

      if (result.success) {
        const details = result.details || {};
        const statusUpdate = details.statusUpdate;

        let statusMessage = '';
        if (statusUpdate?.success) {
          statusMessage = '- ✅ **Project status updated** to "Human Review Required"';
        } else if (statusUpdate?.error) {
          statusMessage = `- ⚠️ **Project status update failed:** ${statusUpdate.error}`;
        } else {
          statusMessage = '- ℹ️ **Project status update** (configuration needed)';
        }

        return {
          content: [{
            type: "text",
            text: `✅ **GitHub Workflow Completed Successfully!**

**Actions Performed:**
- ✅ **Review comment added** to issue #${args.issueNumber}
- ✅ **Reviewer notified** (${args.reviewerMention || '@mouimet-infinisoft'})
- ✅ **Document linked** in comment
${statusMessage}

**Next Steps:**
- The reviewer will be notified about the completed document
- They can access the document directly via the provided link
- Project status reflects the current workflow state

**Document:** [${args.documentTitle}](${args.documentUrl})`
          }]
        };
      } else {
        return {
          content: [{
            type: "text",
            text: `❌ **GitHub Workflow Failed**

**Error:** ${result.error}

**Details:** ${JSON.stringify(result.details, null, 2)}

Please check your GitHub permissions and project configuration.`
          }]
        };
      }
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `❌ **GitHub Workflow Error**

An unexpected error occurred while executing the GitHub workflow:

**Error:** ${error instanceof Error ? error.message : String(error)}

Please try again or contact support if the issue persists.`
        }]
      };
    }
  }
}

export const githubWorkflowTool = new GitHubWorkflowTool();
