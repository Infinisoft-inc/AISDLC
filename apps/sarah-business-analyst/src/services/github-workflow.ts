import { Octokit } from "@octokit/rest";

/**
 * GitHub Workflow Service for managing issues, projects, and comments
 */
export class GitHubWorkflowService {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(octokit: Octokit, owner: string, repo: string) {
    this.octokit = octokit;
    this.owner = owner;
    this.repo = repo;
  }

  /**
   * Update an issue description with progress checkmarks
   */
  async updateIssueDescription(
    issueNumber: number,
    newDescription: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.octokit.rest.issues.update({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        body: newDescription,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Add a comment to an issue
   */
  async addIssueComment(
    issueNumber: number,
    comment: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.octokit.rest.issues.createComment({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        body: comment,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Update project item status using GraphQL API
   */
  async updateProjectItemStatus(
    projectId: string,
    itemId: string,
    fieldId: string,
    optionId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const mutation = `
        mutation UpdateProjectV2ItemFieldValue($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: ProjectV2FieldValue!) {
          updateProjectV2ItemFieldValue(input: {
            projectId: $projectId
            itemId: $itemId
            fieldId: $fieldId
            value: $value
          }) {
            projectV2Item {
              id
            }
          }
        }
      `;

      await this.octokit.graphql(mutation, {
        projectId,
        itemId,
        fieldId,
        value: {
          singleSelectOptionId: optionId
        }
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get project information and field IDs
   */
  async getProjectInfo(projectNumber: number): Promise<{
    success: boolean;
    data?: {
      projectId: string;
      statusFieldId: string;
      statusOptions: { [key: string]: string };
    };
    error?: string;
  }> {
    try {
      const query = `
        query GetProject($owner: String!, $number: Int!) {
          organization(login: $owner) {
            projectV2(number: $number) {
              id
              fields(first: 20) {
                nodes {
                  ... on ProjectV2SingleSelectField {
                    id
                    name
                    options {
                      id
                      name
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const result: any = await this.octokit.graphql(query, {
        owner: this.owner,
        number: projectNumber,
      });

      const project = result.organization.projectV2;
      const statusField = project.fields.nodes.find((field: any) =>
        field.name === 'Status' || field.name === 'status'
      );

      if (!statusField) {
        return {
          success: false,
          error: 'Status field not found in project'
        };
      }

      const statusOptions: { [key: string]: string } = {};
      statusField.options.forEach((option: any) => {
        statusOptions[option.name] = option.id;
      });

      return {
        success: true,
        data: {
          projectId: project.id,
          statusFieldId: statusField.id,
          statusOptions
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Find project item ID for a given issue
   */
  async findProjectItemByIssue(projectId: string, issueNumber: number): Promise<{
    success: boolean;
    itemId?: string;
    error?: string;
  }> {
    try {
      const query = `
        query FindProjectItem($owner: String!, $repo: String!, $issueNumber: Int!) {
          repository(owner: $owner, name: $repo) {
            issue(number: $issueNumber) {
              projectItems(first: 10) {
                nodes {
                  id
                  project {
                    id
                  }
                }
              }
            }
          }
        }
      `;

      const result: any = await this.octokit.graphql(query, {
        owner: this.owner,
        repo: this.repo,
        issueNumber,
      });

      const issue = result.repository.issue;
      if (!issue || !issue.projectItems.nodes.length) {
        return {
          success: false,
          error: `Issue #${issueNumber} not found in any projects`
        };
      }

      // Find the project item that belongs to our target project
      const projectItem = issue.projectItems.nodes.find((item: any) =>
        item.project.id === projectId
      );

      if (!projectItem) {
        return {
          success: false,
          error: `Issue #${issueNumber} not found in project ${projectId}`
        };
      }

      return {
        success: true,
        itemId: projectItem.id
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Complete workflow: update issue, add comment, and update project status
   */
  async completeDocumentWorkflow(options: {
    issueNumber: number;
    projectNumber: number;
    documentUrl: string;
    documentTitle: string;
    reviewerMention?: string;
    taskDescription?: string;
  }): Promise<{ success: boolean; error?: string; details?: any }> {
    const results: any = {};

    try {
      // 1. Add review comment
      const reviewComment = `🎉 **Document Completed!**

I have finished a first draft of **${options.documentTitle}**.

📄 **Document:** [${options.documentTitle}](${options.documentUrl})

${options.reviewerMention ? `${options.reviewerMention}, can you review for approval?` : 'Ready for review and approval.'}

${options.taskDescription ? `\n**Task:** ${options.taskDescription}` : ''}

---
*Generated by Sarah - AI Business Analyst*`;

      const commentResult = await this.addIssueComment(options.issueNumber, reviewComment);
      results.comment = commentResult;

      if (!commentResult.success) {
        return {
          success: false,
          error: `Failed to add comment: ${commentResult.error}`,
          details: results
        };
      }

      // 2. Get project info and update status
      const projectInfo = await this.getProjectInfo(options.projectNumber);
      results.projectInfo = projectInfo;

      if (projectInfo.success && projectInfo.data) {
        // Look for the exact status option (case-sensitive)
        const humanReviewOptionId = projectInfo.data.statusOptions['Human Review Required'] ||
                                   projectInfo.data.statusOptions['Review Required'] ||
                                   projectInfo.data.statusOptions['In Review'];

        if (humanReviewOptionId) {
          // Find the project item for this issue
          const itemResult = await this.findProjectItemByIssue(
            projectInfo.data.projectId,
            options.issueNumber
          );
          results.itemLookup = itemResult;

          if (itemResult.success && itemResult.itemId) {
            // Update the project item status
            const statusUpdateResult = await this.updateProjectItemStatus(
              projectInfo.data.projectId,
              itemResult.itemId,
              projectInfo.data.statusFieldId,
              humanReviewOptionId
            );
            results.statusUpdate = statusUpdateResult;
          } else {
            results.statusUpdate = {
              success: false,
              error: `Failed to find project item: ${itemResult.error}`
            };
          }
        } else {
          results.statusUpdate = {
            success: false,
            error: 'Human Review Required status option not found in project'
          };
        }
      }

      return {
        success: true,
        details: results
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        details: results
      };
    }
  }
}
