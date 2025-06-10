/**
 * Tool Handlers
 * Single responsibility: Handle all MCP tool calls
 */

import { processMessageForJordan } from '../messaging/index.js';
import {
  createProjectStructure,
  createProjectKickoff,
  createEpicIssue,
  createFeatureIssue,
  createTaskIssue,
  createDocumentStructure
} from '../github/index.js';
import { testGraphQLFunctionality } from './testGraphQL.js';
import { getProjectInfo } from './getProjectInfo.js';
import type { JordanMemoryManager } from '../memory.js';
import type { JordanTrainingSystem } from '../training.js';

export interface ToolHandlerContext {
  memory: JordanMemoryManager;
  training: JordanTrainingSystem;
}

export async function handleToolCall(
  name: string,
  args: any,
  context: ToolHandlerContext
) {
  const { memory, training } = context;

  switch (name) {
    case "complete-training":
      try {
        const trainingResult = await training.completeTraining();
        return {
          content: [{ type: "text", text: trainingResult }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Training failed: ${error instanceof Error ? error.message : String(error)}\n\nPlease ensure the ai-to-ai-methodology files are available in the workspace.`,
          }],
        };
      }

    case "process-message-for-jordan":
      const { message, context: msgContext = "general" } = args as { message: string; context?: string };
      try {
        // Record the conversation
        memory.addConversation('human', message, msgContext, 'medium');

        // Process message and return enhanced prompt for LLM
        const enhancedPrompt = await processMessageForJordan(message, msgContext, memory);

        return {
          content: [{ type: "text", text: enhancedPrompt }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Error processing message for Jordan: ${error instanceof Error ? error.message : String(error)}`,
          }],
        };
      }

    case "get-project-status":
      const contextSummary = memory.generateContextSummary();
      return {
        content: [{ type: "text", text: contextSummary }],
      };

    case "create-project-structure":
      try {
        const result = await createProjectStructure(args, memory);
        
        if (result.success && result.data) {
          const { epics, features, tasks } = result.data;

          let structureDetails = '';
          epics.forEach((epic: any) => {
            structureDetails += `\n✅ **Epic #${epic.number}:** ${epic.title}`;

            const epicFeatures = features.filter((f: any) =>
              f.body && f.body.includes(`Epic #${epic.number}`) ||
              f.title.includes(epic.title.replace('[EPIC] ', ''))
            );

            epicFeatures.forEach((feature: any) => {
              structureDetails += `\n  ├─ **Feature #${feature.number}:** ${feature.title}`;

              const featureTasks = tasks.filter((t: any) =>
                t.body && t.body.includes(`Feature #${feature.number}`) ||
                t.title.includes(feature.title.replace('[FEATURE] ', ''))
              );

              featureTasks.forEach((task: any, taskIndex: number) => {
                const isLast = taskIndex === featureTasks.length - 1;
                structureDetails += `\n  ${isLast ? '└─' : '├─'} **Task #${task.number}:** ${task.title}`;
              });
            });
          });

          const response = `🎉 **Comprehensive GitHub Project Created Successfully!**

**Project:** ${args.projectName}
**Repository:** ${result.data.repository.html_url}
**Project Board:** ${result.data.project.url}

**📊 Complete Project Structure:**
✅ Repository: ${result.data.repository.name}
${structureDetails}
✅ GitHub Project board configured
✅ All issues organized and linked

**📈 Project Statistics:**
- **${epics.length} Epics** (Domain-level organization)
- **${features.length} Features** (Functional requirements)
- **${tasks.length} Tasks** (Implementation work)
- **Total: ${epics.length + features.length + tasks.length} Issues**

**🚀 AI-SDLC Workflow Ready:**
- Domain-driven Epic organization
- Feature-based development workflow
- Task-level implementation tracking
- Complete traceability from requirements to code

Your comprehensive project structure is now live on GitHub and ready for AI-SDLC development!`;

          memory.addConversation('jordan', response, 'project_structure', 'high');
          return { content: [{ type: "text", text: response }] };
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        const errorResponse = `❌ **Integration Error**

**Project:** ${args.projectName}
**Error:** ${error instanceof Error ? error.message : String(error)}

I'll track the project locally while we resolve the integration issue.

**Status:** Project tracked in memory, GitHub integration needs attention.`;

        memory.addConversation('jordan', errorResponse, 'project_structure', 'high');
        return { content: [{ type: "text", text: errorResponse }] };
      }

    case "create-epic-issue":
      try {
        const result = await createEpicIssue(args, memory);
        
        if (result.success && result.data) {
          const response = `✅ **Epic Issue Created Successfully!**

**Epic:** ${result.data.title}
**Issue #:** ${result.data.number}
**URL:** ${result.data.html_url}
**Branch:** ${result.data.linkedBranch?.branchName || 'Not created'}

Epic is ready for feature breakdown and development planning.`;

          return { content: [{ type: "text", text: response }] };
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        const errorResponse = `❌ **Epic Creation Failed**

**Error:** ${error instanceof Error ? error.message : String(error)}

Please check repository access and try again.`;

        return { content: [{ type: "text", text: errorResponse }] };
      }

    case "create-feature-issue":
      try {
        const result = await createFeatureIssue(args, memory);
        
        if (result.success && result.data) {
          const response = `✅ **Feature Issue Created Successfully!**

**Feature:** ${result.data.title}
**Issue #:** ${result.data.number}
**URL:** ${result.data.html_url}
**Parent Epic:** #${args.parentEpicNumber}
**Branch:** ${result.data.linkedBranch?.branchName || 'Not created'}

Feature is linked to Epic and ready for task breakdown.`;

          return { content: [{ type: "text", text: response }] };
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        const errorResponse = `❌ **Feature Creation Failed**

**Error:** ${error instanceof Error ? error.message : String(error)}

Please check repository access and parent Epic number.`;

        return { content: [{ type: "text", text: errorResponse }] };
      }

    case "create-task-issue":
      try {
        const result = await createTaskIssue(args, memory);
        
        if (result.success && result.data) {
          const response = `✅ **Task Issue Created Successfully!**

**Task:** ${result.data.title}
**Issue #:** ${result.data.number}
**URL:** ${result.data.html_url}
**Parent Feature:** #${args.parentFeatureNumber}
**Branch:** ${result.data.linkedBranch?.branchName || 'Not created'}

Task is linked to Feature and ready for implementation.`;

          return { content: [{ type: "text", text: response }] };
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        const errorResponse = `❌ **Task Creation Failed**

**Error:** ${error instanceof Error ? error.message : String(error)}

Please check repository access and parent Feature number.`;

        return { content: [{ type: "text", text: errorResponse }] };
      }

    case "create-project-kickoff":
      try {
        const result = await createProjectKickoff(args, memory);

        if (result.success && result.data) {
          const response = `🎉 **AI-SDLC Project Kickoff Created Successfully!**

**Project:** ${args.projectName}
**Repository:** ${result.data.repository.html_url}
**Project Board:** ${result.data.project.url}

**📋 AI-SDLC Workflow Created:**
✅ **Epic:** ${result.data.epic.title} (#${result.data.epic.number})
✅ **Tasks Created:** ${result.data.tasks.length} workflow tasks

**🎯 Next Steps:**
1. **Business Case Creation** - Assign to Sarah (Business Analyst)
2. **Business & User Requirements** - Assign to Sarah
3. **Architecture & System Design** - Assign to Alex (Architect)
4. **Project Structure Creation** - Assign to Jordan

**🚀 AI-SDLC Methodology Active:**
- Human-AI collaboration framework established
- Standard workflow tasks ready for assignment
- GitHub project board configured for tracking
- Ready to begin Phase 1.1 - Business Case Creation

Your AI-SDLC project is now ready for collaborative development!`;

          memory.addConversation('jordan', response, 'project_kickoff', 'high');
          return { content: [{ type: "text", text: response }] };
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        const errorResponse = `❌ **Project Kickoff Failed**

**Project:** ${args.projectName}
**Error:** ${error instanceof Error ? error.message : String(error)}

Please check GitHub permissions and try again.`;

        return { content: [{ type: "text", text: errorResponse }] };
      }

    case "test-graphql":
      try {
        const result = await testGraphQLFunctionality(args.projectId, memory);

        if (result.success && result.data) {
          const response = `🧪 **GraphQL Functionality Test Results**

**Project ID:** ${args.projectId}

**🔍 Client Analysis:**
- **Has GraphQL:** ${result.data.hasGraphQL ? '✅ Yes' : '❌ No'}
- **Viewer Login:** ${result.data.viewerLogin || 'Not available'}
- **Project Fields Found:** ${result.data.projectFields?.length || 0}

**📋 Test Results:**
${result.data.testResult}

**🎯 Diagnosis:**
${result.data.hasGraphQL ?
  'GraphQL client is working properly. Field creation should be possible.' :
  'GraphQL client is missing. This explains why field creation fails.'
}`;

          return { content: [{ type: "text", text: response }] };
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        const errorResponse = `❌ **GraphQL Test Failed**

**Error:** ${error instanceof Error ? error.message : String(error)}

This indicates a fundamental issue with the GitHub GraphQL client setup.`;

        return { content: [{ type: "text", text: errorResponse }] };
      }

    case "get-project-info":
      try {
        const result = await getProjectInfo(args, memory);

        if (result.success && result.data) {
          return { content: [{ type: "text", text: result.data.summary }] };
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        const errorResponse = `❌ **Project Info Query Failed**

**Error:** ${error instanceof Error ? error.message : String(error)}

Please check organization name and permissions.`;

        return { content: [{ type: "text", text: errorResponse }] };
      }

    case "create-document-structure":
      try {
        const result = await createDocumentStructure(args, memory);

        if (result.success && result.data) {
          const response = `🎉 **AI-SDLC Document Structure Created Successfully!**

**Project:** ${args.projectName}
**Repository:** https://github.com/${args.owner}/${args.repo}

**📁 Files Created:** ${result.data.filesCreated.length}
${result.data.filesCreated.map((file: string) => `- ✅ ${file}`).join('\n')}

**🎯 Ready for AI-SDLC Workflow:**
- **Professional README** - Showcases AI-SDLC methodology
- **Complete Templates** - Ready for Sarah and Alex to use
- **Discussion-Based Workflow** - Human-AI collaboration framework
- **Phase Structure** - Clear progression from planning to implementation

**🚀 Next Steps:**
1. **Sarah** can start Business Case discussions using the templates
2. **Alex** can begin Architecture discussions when ready
3. **Human oversight** at each phase for approval
4. **Jordan** tracks progress through GitHub project board

Your AI-SDLC project is now fully structured and ready for collaborative development!`;

          memory.addConversation('jordan', response, 'document_structure', 'high');
          return { content: [{ type: "text", text: response }] };
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        const errorResponse = `❌ **Document Structure Creation Failed**

**Project:** ${args.projectName}
**Error:** ${error instanceof Error ? error.message : String(error)}

Please check repository access and try again.`;

        return { content: [{ type: "text", text: errorResponse }] };
      }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
