#!/usr/bin/env node

/**
 * Clean Sarah - Single Responsibility Architecture
 * Only handles MCP server setup and coordination
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

import { ToolRegistry } from './tool-registry.js';
import { ProjectMemory } from './project-memory.js';
import { DocumentStorage } from './services/storage/implementations/document-storage.js';
import { StorageConfig } from './config/storage-config.js';
import { MockStorage } from './services/storage/implementations/mock-storage.js';
import { SARAH_TEMPLATES } from './services/templates/templates.js';

import { RememberTool } from './tools/remember-tool.js';
import { SetProjectTool, ProjectContext } from './tools/set-project-tool.js';
import { GenerateDocumentTool } from './tools/generate-document-tool.js';
import { SaveDocumentTool } from './tools/save-document-tool.js';
import { ProcessMessageFor } from './tools/process-message-for.js';
import { ResourceManager } from './services/resources/resource-manager.js';
import { PromptRegistry } from './services/prompts/prompt-registry.js';
import { GitHubWorkflowService } from './services/github-workflow.js';
import { githubWorkflowTool } from './tools/github-workflow-tool.js';
import { GitHubStorage } from './services/storage/implementations/github-storage.js';

export class Sarah {
  private server: Server;
  private toolRegistry: ToolRegistry;
  private resourceManager: ResourceManager;
  private promptRegistry: PromptRegistry;
  private projectContext?: ProjectContext;

  constructor() {
    this.server = new Server(
      { name: "sarah", version: "1.0.0" },
      { capabilities: { tools: {}, resources: {}, prompts: {} } }
    );

    this.toolRegistry = new ToolRegistry();
    this.resourceManager = new ResourceManager();
    this.promptRegistry = new PromptRegistry();
  }

  private async initialize() {
    await this.setupTools();
    this.setupHandlers();
  }

  private async setupTools() {
    // Create shared dependencies
    const projectMemory = new ProjectMemory();

    // Try Doppler integration first, then environment variables, then Doppler config, then mock
    let storage;
    let storageMessage = '';

    if (process.env.DOPPLER_TOKEN) {
      try {
        const result = await StorageConfig.createWithDopplerIntegration();
        storage = result.storage;
        storageMessage = result.message;
        console.log(storageMessage);
      } catch (error) {
        console.warn('Failed to create Doppler integration storage, trying environment variables:', error);
        const result = StorageConfig.createWithEnvironment();
        storage = result.storage;
        storageMessage = `⚠️ Doppler integration failed. ${result.message}`;
      }
    } else if (process.env.GITHUB_TOKEN) {
      const result = StorageConfig.createWithEnvironment();
      storage = result.storage;
      storageMessage = result.message;
      console.log(storageMessage);
    } else {
      try {
        storage = StorageConfig.createFromDoppler();
        storageMessage = '✅ Using storage configured via Doppler JSON config.';
        console.log(storageMessage);
      } catch (error) {
        console.warn('Failed to create Doppler storage, using mock storage:', error);
        storage = new MockStorage();
        storageMessage = '⚠️ No GitHub credentials found. Using mock storage - documents will NOT be saved to GitHub.';
        console.log(storageMessage);
      }
    }

    const documentSaver = new DocumentStorage(storage);

    // Setup GitHub workflow service if we have GitHub storage
    let workflowService: GitHubWorkflowService | undefined;
    if (storage instanceof GitHubStorage) {
      // Extract the Octokit client from GitHubStorage
      const octokit = (storage as any).octokit;
      if (octokit) {
        workflowService = new GitHubWorkflowService(octokit, 'Infinisoft-inc', 'github-test');
        githubWorkflowTool.setWorkflowService(workflowService);
      }
    }

    // Setup resource manager with dependencies
    this.resourceManager.setProjectMemory(projectMemory);
    this.resourceManager.setStorage(storage);

    // Register templates as resources
    SARAH_TEMPLATES.forEach(template => {
      this.resourceManager.registerTemplate(template.name, template);
    });

    // Register tools
    this.toolRegistry.register(new RememberTool(projectMemory));
    this.toolRegistry.register(new SetProjectTool(projectMemory));
    this.toolRegistry.register(new GenerateDocumentTool(projectMemory, this.promptRegistry));
    this.toolRegistry.register(new SaveDocumentTool(documentSaver, () => this.projectContext));
    this.toolRegistry.register(new ProcessMessageFor("Sarah", "AI Business Analyst"));

    // Register GitHub workflow tool if available
    if (workflowService) {
      this.toolRegistry.register(githubWorkflowTool);
    }
  }

  private setupHandlers() {
    // List tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.toolRegistry.getSchemas()
    }));

    // Call tools
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      // Add conversation to resource manager for context
      if (name === "process-message-for-sarah" && args && args.message) {
        this.resourceManager.addConversation(`User: ${args.message}`);
      }

      // Handle set-project specially to capture context
      if (name === "set-project") {
        const result = await this.toolRegistry.execute(name, args);
        if (result.context) {
          this.projectContext = result.context;
        }
        return result;
      }

      return await this.toolRegistry.execute(name, args);
    });

    // List resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: await this.resourceManager.listResources()
    }));

    // Read resource
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      const content = await this.resourceManager.readResource(uri);
      return {
        contents: [content]
      };
    });

    // List prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: this.promptRegistry.listPrompts()
    }));

    // Get prompt
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const promptResponse = this.promptRegistry.getPrompt(name, args || {});
      return {
        description: promptResponse.description,
        messages: promptResponse.messages
      };
    });
  }

  async run() {
    await this.initialize();
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Sarah running on stdio");
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  const sarah = new Sarah();
  sarah.run().catch(console.error);
}
