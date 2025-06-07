#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { JordanMemoryManager } from './memory.js';
import { JordanTrainingSystem } from './training.js';
import {
  createRepository,
  createProject,
  createEpic,
  createFeature,
  createTask,
  addIssueToProject
} from '@brainstack/github-service';

class JordanProjectManagerServer {
  private server: Server;
  private memory: JordanMemoryManager;
  private training: JordanTrainingSystem;

  constructor() {
    this.server = new Server(
      {
        name: "jordan-project-manager",
        version: "1.0.0",
      },
      {
        capabilities: {
          prompts: {},
          resources: {},
          tools: {},
        },
      }
    );

    // Initialize Jordan's systems
    this.memory = new JordanMemoryManager();
    this.training = new JordanTrainingSystem(this.memory);

    this.setupHandlers();
  }

  /**
   * Generate intelligent response using LLM with Jordan's context
   */
  private async generateIntelligentResponse(message: string, context: string): Promise<string> {
    // Get Jordan's current memory and context
    const memoryData = this.memory.getMemory();
    const recentConversations = this.memory.getRecentConversations(5);

    // Build Jordan's context for the LLM
    const jordanContext = this.buildJordanContext(memoryData, recentConversations, context);

    // Create the prompt for the LLM
    const prompt = this.createJordanPrompt(jordanContext, message);

    // Return the prompt for Augment Code to process
    return prompt;
  }



  private buildJordanContext(memoryData: any, recentConversations: any[], context: string): string {
    return `
JORDAN'S IDENTITY:
- Name: Jordan, AI Project Manager
- Personality: Organized, Clear, Directive, Collaborative
- Role: Project structure creation, GitHub setup, team coordination
- Phases: 1.4 (Project Structure Creation) and 2.3 (Team Coordination)

CURRENT PROJECT:
${memoryData.currentProject ? `
- Project: ${memoryData.currentProject.name}
- Phase: ${memoryData.currentProject.phase}
- Status: ${memoryData.currentProject.status}
- Focus: ${memoryData.currentProject.currentFocus}
` : '- No active project'}

RECENT CONVERSATIONS:
${recentConversations.map(c => `[${c.speaker}]: ${c.message.substring(0, 100)}...`).join('\n')}

AI-SDLC TRAINING:
- Methodology understanding: ${memoryData.aisdlcTraining.completed ? 'Complete' : 'Incomplete'}
- Key learnings: ${memoryData.aisdlcTraining.methodologyUnderstanding.length} concepts

CONTEXT: ${context}
`;
  }

  private createJordanPrompt(jordanContext: string, userMessage: string): string {
    return `You are Jordan, an AI Project Manager. Respond to the user's message using your personality and knowledge.

${jordanContext}

USER MESSAGE: "${userMessage}"

Respond as Jordan would - organized, clear, directive, and collaborative. Focus on project management, structure, and coordination.

IMPORTANT: After generating your response, call the speech_response_talk tool with the final response text to send it to the voice application.`;
  }



  private setupHandlers() {
    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: [
        {
          name: "jordan-introduction",
          description: "Jordan's introduction and capabilities as AI Project Manager",
        },
        {
          name: "jordan-training-status",
          description: "Check Jordan's AI-SDLC training completion status",
        },
      ],
    }));

    // Get specific prompt
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      if (request.params.name === "jordan-introduction") {
        const memoryData = this.memory.getMemory();
        const trainingCompleted = memoryData.aisdlcTraining.completed;

        return {
          description: "Jordan's introduction and capabilities",
          messages: [
            {
              role: "assistant",
              content: {
                type: "text",
                text: `👨‍💼 **Hi, I'm Jordan, your AI Project Manager!**

${trainingCompleted ? '🎓 **Fully Trained & Ready**' : '⚠️ **Training Required**'}

**My Personality:**
- Organized, Clear, Directive, Collaborative
- Action-oriented with efficient communication
- Team-focused with structured planning approach

**My Expertise:**
- Project structure creation and management
- GitHub repository and project setup
- Work breakdown structure (WBS)
- Team coordination and progress tracking
- EPIC and milestone creation
- AI-SDLC methodology implementation

**What I Can Do:**
- Create structured project plans with clear milestones
- Set up GitHub repositories with proper EPIC organization
- Coordinate team members and track progress
- Identify blockers and manage dependencies
- Follow AI-SDLC methodology with complete traceability

${trainingCompleted ?
  "I'm ready to organize your project properly! Let's get started. 🚀" :
  "I need to complete my AI-SDLC training first. Use the 'complete-training' tool to get me ready!"}`,
              },
            },
          ],
        };
      }

      if (request.params.name === "jordan-training-status") {
        const status = this.training.getTrainingStatus();
        const memoryData = this.memory.getMemory();

        return {
          description: "Jordan's training status",
          messages: [
            {
              role: "assistant",
              content: {
                type: "text",
                text: `📚 **Jordan's Training Status**

${status}

**Training Completed:** ${memoryData.aisdlcTraining.completed ? 'Yes ✅' : 'No ❌'}
**Methodology Understanding:** ${memoryData.aisdlcTraining.methodologyUnderstanding.length} concepts
**Role Knowledge:** ${memoryData.aisdlcTraining.roleSpecificKnowledge.length} skills

${!memoryData.aisdlcTraining.completed ?
  "Use the 'complete-training' tool to complete my AI-SDLC training!" :
  "Training complete! I'm ready to work on your projects."}`,
              },
            },
          ],
        };
      }

      throw new Error(`Unknown prompt: ${request.params.name}`);
    });

    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "complete-training",
          description: "Complete Jordan's AI-SDLC methodology training",
          inputSchema: {
            type: "object",
            properties: {},
            required: [],
          },
        },
        {
          name: "chat-with-jordan",
          description: "Have a conversation with Jordan about project management",
          inputSchema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description: "Your message to Jordan",
              },
              context: {
                type: "string",
                description: "Context for the conversation (optional)",
                default: "general"
              },
            },
            required: ["message"],
          },
        },
        {
          name: "get-project-status",
          description: "Get current project status and Jordan's memory",
          inputSchema: {
            type: "object",
            properties: {},
            required: [],
          },
        },
        {
          name: "create-project-structure",
          description: "Create GitHub project structure from SRS requirements",
          inputSchema: {
            type: "object",
            properties: {
              projectName: {
                type: "string",
                description: "Name of the project",
              },
              srsContent: {
                type: "string",
                description: "SRS content with domains and functional requirements",
              },
            },
            required: ["projectName", "srsContent"],
          },
        },
        {
          name: "create-epic-issue",
          description: "Create a single Epic issue in an existing repository",
          inputSchema: {
            type: "object",
            properties: {
              owner: {
                type: "string",
                description: "Repository owner (organization or user)",
              },
              repo: {
                type: "string",
                description: "Repository name",
              },
              title: {
                type: "string",
                description: "Epic title (will be prefixed with [EPIC] if not present)",
              },
              body: {
                type: "string",
                description: "Epic description and requirements",
              },
              labels: {
                type: "array",
                items: { type: "string" },
                description: "Labels to add to the epic",
                default: ["epic"]
              },
            },
            required: ["owner", "repo", "title", "body"],
          },
        },
        {
          name: "create-feature-issue",
          description: "Create a single Feature issue linked to an Epic",
          inputSchema: {
            type: "object",
            properties: {
              owner: {
                type: "string",
                description: "Repository owner",
              },
              repo: {
                type: "string",
                description: "Repository name",
              },
              title: {
                type: "string",
                description: "Feature title (will be prefixed with [FEATURE] if not present)",
              },
              body: {
                type: "string",
                description: "Feature description and acceptance criteria",
              },
              parentEpicNumber: {
                type: "number",
                description: "Epic issue number to link this feature to",
              },
              labels: {
                type: "array",
                items: { type: "string" },
                description: "Labels to add to the feature",
                default: ["feature"]
              },
            },
            required: ["owner", "repo", "title", "body", "parentEpicNumber"],
          },
        },
        {
          name: "create-task-issue",
          description: "Create a single Task issue linked to a Feature",
          inputSchema: {
            type: "object",
            properties: {
              owner: {
                type: "string",
                description: "Repository owner",
              },
              repo: {
                type: "string",
                description: "Repository name",
              },
              title: {
                type: "string",
                description: "Task title (will be prefixed with [TASK] if not present)",
              },
              body: {
                type: "string",
                description: "Task description and implementation details",
              },
              parentFeatureNumber: {
                type: "number",
                description: "Feature issue number to link this task to",
              },
              labels: {
                type: "array",
                items: { type: "string" },
                description: "Labels to add to the task",
                default: ["task"]
              },
            },
            required: ["owner", "repo", "title", "body", "parentFeatureNumber"],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === "complete-training") {
        try {
          const trainingResult = await this.training.completeTraining();

          return {
            content: [
              {
                type: "text",
                text: trainingResult,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `❌ Training failed: ${error instanceof Error ? error.message : String(error)}\n\nPlease ensure the ai-to-ai-methodology files are available in the workspace.`,
              },
            ],
          };
        }
      }

      if (name === "chat-with-jordan") {
        const { message, context = "general" } = args as { message: string; context?: string };

        try {
          // Record the conversation
          this.memory.addConversation('human', message, context, 'medium');

          // Generate intelligent response using LLM with Jordan's context
          const response = await this.generateIntelligentResponse(message, context);

          // Record Jordan's response
          this.memory.addConversation('jordan', response, context, 'medium');

          return {
            content: [
              {
                type: "text",
                text: `👨‍💼 **Jordan:** ${response}`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `👨‍💼 **Jordan:** I apologize, I encountered an issue processing your message. Let me try a simpler response: I'm here to help organize your project! What specific aspect would you like me to focus on?`,
              },
            ],
          };
        }
      }

      if (name === "get-project-status") {
        const contextSummary = this.memory.generateContextSummary();

        return {
          content: [
            {
              type: "text",
              text: contextSummary,
            },
          ],
        };
      }

      if (name === "create-project-structure") {
        const { projectName, srsContent } = args as { projectName: string; srsContent: string };

        try {
          // Update project in memory
          this.memory.updateProject({
            name: projectName,
            phase: "Project Structure Creation",
            status: "In Progress",
            currentFocus: "GitHub Setup"
          });

          // Create basic project configuration from SRS
          const projectConfig = {
            repository: {
              name: projectName.toLowerCase().replace(/\s+/g, '-'),
              description: `Project: ${projectName} - Created by Jordan AI Project Manager`,
              private: false
            },
            epic: {
              title: `[EPIC] ${projectName} - Main Development Epic`,
              body: `# ${projectName} Development Epic\n\n${srsContent}\n\n## Project Overview\nThis epic contains all development work for ${projectName}.`,
              labels: ['epic', 'project-management']
            },
            features: [
              {
                title: `[FEATURE] Core Implementation`,
                body: `# Core Implementation Feature\n\nImplement the core functionality for ${projectName}.\n\n## Requirements\n${srsContent}`,
                labels: ['feature', 'core'],
                tasks: [
                  {
                    title: `[TASK] Initial Setup and Configuration`,
                    body: `# Initial Setup Task\n\nSet up the basic project structure and configuration for ${projectName}.`,
                    labels: ['task', 'setup']
                  }
                ]
              }
            ]
          };

          // Call GitHub Service to create real project structure
          const installationId = parseInt(process.env.GITHUB_INSTALLATION_ID || '70009309');

          // Step 1: Create Repository
          const repoResult = await createRepository(projectConfig.repository, installationId);
          if (!repoResult.success) {
            throw new Error(`Repository creation failed: ${repoResult.error}`);
          }

          const owner = repoResult.data.full_name.split('/')[0];
          const repo = repoResult.data.name;

          // Step 2: Create GitHub Project
          const projectResult = await createProject(owner, `${projectName} Development`, `Project management for ${projectName}`, installationId);
          if (!projectResult.success) {
            throw new Error(`Project creation failed: ${projectResult.error}`);
          }

          // Step 3: Create Epic
          const epicResult = await createEpic(owner, repo, projectConfig.epic, installationId);
          if (!epicResult.success) {
            throw new Error(`Epic creation failed: ${epicResult.error}`);
          }

          // Step 4: Create Feature
          const featureResult = await createFeature(owner, repo, projectConfig.features[0], epicResult.data.number, installationId);
          if (!featureResult.success) {
            throw new Error(`Feature creation failed: ${featureResult.error}`);
          }

          // Step 5: Create Task
          const taskResult = await createTask(owner, repo, projectConfig.features[0].tasks[0], featureResult.data.number, installationId);
          if (!taskResult.success) {
            throw new Error(`Task creation failed: ${taskResult.error}`);
          }

          // Step 6: Add issues to project
          await addIssueToProject(projectResult.data.id, owner, repo, epicResult.data.number, 'epic', undefined, installationId);
          await addIssueToProject(projectResult.data.id, owner, repo, featureResult.data.number, 'feature', epicResult.data.number, installationId);
          await addIssueToProject(projectResult.data.id, owner, repo, taskResult.data.number, 'task', featureResult.data.number, installationId);

          // Update memory with real project data
          this.memory.updateProject({
            name: projectName,
            phase: "Project Structure Created",
            status: "Active",
            currentFocus: "Development Ready",
            githubUrl: repoResult.data.html_url,
            projectUrl: projectResult.data.url
          });

          const response = `🎉 **Real GitHub Project Created Successfully!**

**Project:** ${projectName}
**Repository:** ${repoResult.data.html_url}
**Project Board:** ${projectResult.data.url}

**Created Structure:**
✅ Repository: ${repo}
✅ Epic issue #${epicResult.data.number}: ${projectConfig.epic.title}
✅ Feature issue #${featureResult.data.number}: ${projectConfig.features[0].title}
✅ Task issue #${taskResult.data.number}: ${projectConfig.features[0].tasks[0].title}
✅ GitHub Project board configured
✅ All issues organized and linked

**Development Workflow Ready:**
- Epic Branch → Feature Branch → Task Branch
- Complete parent-child issue relationships
- Project board for tracking progress

Your project structure is now live on GitHub and ready for development!`;

          this.memory.addConversation('jordan', response, 'project_structure', 'high');

          return {
            content: [
              {
                type: "text",
                text: response,
              },
            ],
          };
        } catch (error) {
          // Handle integration errors
          const errorResponse = `❌ **Integration Error**

**Project:** ${projectName}
**Error:** ${error instanceof Error ? error.message : String(error)}

I'll track the project locally while we resolve the integration issue.

**Status:** Project tracked in memory, GitHub integration needs attention.`;

          this.memory.addConversation('jordan', errorResponse, 'project_structure', 'high');

          return {
            content: [
              {
                type: "text",
                text: errorResponse,
              },
            ],
          };
        }
      }

      if (name === "create-epic-issue") {
        const { owner, repo, title, body, labels = ["epic"] } = args as {
          owner: string; repo: string; title: string; body: string; labels?: string[];
        };

        try {
          const installationId = parseInt(process.env.GITHUB_INSTALLATION_ID || '70009309');

          const epicData = {
            title: title.startsWith('[EPIC]') ? title : `[EPIC] ${title}`,
            body,
            labels
          };

          const result = await createEpic(owner, repo, epicData, installationId);

          if (result.success) {
            const response = `✅ **Epic Issue Created Successfully!**

**Epic:** ${result.data.title}
**Issue #:** ${result.data.number}
**URL:** ${result.data.html_url}
**Branch:** ${result.data.linkedBranch?.branchName || 'Not created'}

Epic is ready for feature breakdown and development planning.`;

            this.memory.addConversation('jordan', response, 'epic_creation', 'high');

            return {
              content: [{ type: "text", text: response }],
            };
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          const errorResponse = `❌ **Epic Creation Failed**

**Error:** ${error instanceof Error ? error.message : String(error)}

Please check repository access and try again.`;

          return {
            content: [{ type: "text", text: errorResponse }],
          };
        }
      }

      if (name === "create-feature-issue") {
        const { owner, repo, title, body, parentEpicNumber, labels = ["feature"] } = args as {
          owner: string; repo: string; title: string; body: string; parentEpicNumber: number; labels?: string[];
        };

        try {
          const installationId = parseInt(process.env.GITHUB_INSTALLATION_ID || '70009309');

          const featureData = {
            title: title.startsWith('[FEATURE]') ? title : `[FEATURE] ${title}`,
            body,
            labels
          };

          const result = await createFeature(owner, repo, featureData, parentEpicNumber, installationId);

          if (result.success) {
            const response = `✅ **Feature Issue Created Successfully!**

**Feature:** ${result.data.title}
**Issue #:** ${result.data.number}
**URL:** ${result.data.html_url}
**Parent Epic:** #${parentEpicNumber}
**Branch:** ${result.data.linkedBranch?.branchName || 'Not created'}

Feature is linked to Epic and ready for task breakdown.`;

            this.memory.addConversation('jordan', response, 'feature_creation', 'high');

            return {
              content: [{ type: "text", text: response }],
            };
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          const errorResponse = `❌ **Feature Creation Failed**

**Error:** ${error instanceof Error ? error.message : String(error)}

Please check repository access and parent Epic number.`;

          return {
            content: [{ type: "text", text: errorResponse }],
          };
        }
      }

      if (name === "create-task-issue") {
        const { owner, repo, title, body, parentFeatureNumber, labels = ["task"] } = args as {
          owner: string; repo: string; title: string; body: string; parentFeatureNumber: number; labels?: string[];
        };

        try {
          const installationId = parseInt(process.env.GITHUB_INSTALLATION_ID || '70009309');

          const taskData = {
            title: title.startsWith('[TASK]') ? title : `[TASK] ${title}`,
            body,
            labels
          };

          const result = await createTask(owner, repo, taskData, parentFeatureNumber, installationId);

          if (result.success) {
            const response = `✅ **Task Issue Created Successfully!**

**Task:** ${result.data.title}
**Issue #:** ${result.data.number}
**URL:** ${result.data.html_url}
**Parent Feature:** #${parentFeatureNumber}
**Branch:** ${result.data.linkedBranch?.branchName || 'Not created'}

Task is linked to Feature and ready for implementation.`;

            this.memory.addConversation('jordan', response, 'task_creation', 'high');

            return {
              content: [{ type: "text", text: response }],
            };
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          const errorResponse = `❌ **Task Creation Failed**

**Error:** ${error instanceof Error ? error.message : String(error)}

Please check repository access and parent Feature number.`;

          return {
            content: [{ type: "text", text: errorResponse }],
          };
        }
      }

      throw new Error(`Unknown tool: ${name}`);
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: "jordan://memory/current",
          name: "Jordan's Current Memory",
          description: "View Jordan's current memory state and project context",
          mimeType: "application/json",
        },
        {
          uri: "jordan://training/status",
          name: "Jordan's Training Status",
          description: "View Jordan's AI-SDLC training completion status",
          mimeType: "application/json",
        },
      ],
    }));

    // Read resource content
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (uri === "jordan://memory/current") {
        const memoryData = this.memory.getMemory();
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify(memoryData, null, 2),
            },
          ],
        };
      }

      if (uri === "jordan://training/status") {
        const memoryData = this.memory.getMemory();
        const trainingData = {
          completed: memoryData.aisdlcTraining.completed,
          methodologyUnderstanding: memoryData.aisdlcTraining.methodologyUnderstanding,
          roleSpecificKnowledge: memoryData.aisdlcTraining.roleSpecificKnowledge,
          lastTrainingUpdate: memoryData.aisdlcTraining.lastTrainingUpdate,
          status: this.training.getTrainingStatus()
        };

        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify(trainingData, null, 2),
            },
          ],
        };
      }

      throw new Error(`Unknown resource: ${uri}`);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Jordan Project Manager MCP Server running on stdio");
  }
}

const server = new JordanProjectManagerServer();
server.run().catch(console.error);
