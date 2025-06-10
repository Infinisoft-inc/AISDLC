/**
 * Resource Manager - MCP Resources for Context Awareness
 * Exposes Sarah's data as MCP resources for LLM access
 */

import { ProjectMemory } from '../../project-memory.js';
import { StorageService } from '../storage/storage.js';

export interface Resource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface ResourceContent {
  uri: string;
  mimeType: string;
  text?: string;
  blob?: Uint8Array;
}

export class ResourceManager {
  private projectMemory?: ProjectMemory;
  private storage?: StorageService;
  private conversationHistory: string[] = [];
  private templates = new Map<string, any>();

  constructor(projectMemory?: ProjectMemory, storage?: StorageService) {
    this.projectMemory = projectMemory;
    this.storage = storage;
  }

  /**
   * Set project memory for resource exposure
   */
  setProjectMemory(memory: ProjectMemory): void {
    this.projectMemory = memory;
  }

  /**
   * Set storage service for document access
   */
  setStorage(storage: StorageService): void {
    this.storage = storage;
  }

  /**
   * Add conversation message to history
   */
  addConversation(message: string): void {
    this.conversationHistory.push(message);
    // Keep only last 50 messages to avoid memory bloat
    if (this.conversationHistory.length > 50) {
      this.conversationHistory = this.conversationHistory.slice(-50);
    }
  }

  /**
   * Register template as resource
   */
  registerTemplate(name: string, template: any): void {
    this.templates.set(name, template);
  }

  /**
   * List all available resources
   */
  async listResources(): Promise<Resource[]> {
    const resources: Resource[] = [];

    // Current project memory
    if (this.projectMemory && this.projectMemory.hasInfo()) {
      resources.push({
        uri: "memory://sarah/current-project",
        name: "Current Project Memory",
        description: "All information gathered about the current project",
        mimeType: "application/json"
      });
    }

    // Conversation history
    if (this.conversationHistory.length > 0) {
      resources.push({
        uri: "memory://sarah/conversations",
        name: "Conversation History", 
        description: "Recent conversation messages for context",
        mimeType: "application/json"
      });
    }

    // Templates
    for (const [name] of this.templates) {
      resources.push({
        uri: `template://sarah/${name}`,
        name: `${name} Template`,
        description: `Template for ${name} document generation`,
        mimeType: "application/json"
      });
    }

    // Documents from actual storage
    if (this.storage) {
      try {
        const listResult = await this.storage.list();
        if (listResult.success && listResult.documents) {
          for (const doc of listResult.documents) {
            resources.push({
              uri: `file://sarah/documents/${doc.path}`,
              name: doc.name,
              description: `Generated document: ${doc.name}`,
              mimeType: "text/markdown"
            });
          }
        }
      } catch (error) {
        // If storage listing fails, continue without document resources
        console.warn('Failed to list documents from storage:', error);
      }
    }

    return resources;
  }

  /**
   * Read resource content by URI
   */
  async readResource(uri: string): Promise<ResourceContent> {
    if (uri === "memory://sarah/current-project") {
      if (!this.projectMemory) {
        throw new Error("Project memory not available");
      }
      
      return {
        uri,
        mimeType: "application/json",
        text: JSON.stringify({
          projectName: this.projectMemory.getName(),
          information: this.projectMemory.getAll(),
          summary: this.projectMemory.getSummary()
        }, null, 2)
      };
    }

    if (uri === "memory://sarah/conversations") {
      return {
        uri,
        mimeType: "application/json",
        text: JSON.stringify({
          messages: this.conversationHistory,
          count: this.conversationHistory.length
        }, null, 2)
      };
    }

    if (uri.startsWith("template://sarah/")) {
      const templateName = uri.replace("template://sarah/", "");
      const template = this.templates.get(templateName);
      
      if (!template) {
        throw new Error(`Template ${templateName} not found`);
      }

      return {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(template, null, 2)
      };
    }

    if (uri.startsWith("file://sarah/documents/")) {
      const filename = uri.replace("file://sarah/documents/", "");

      if (!this.storage) {
        throw new Error("Storage service not available");
      }

      // Read actual content from storage
      const readResult = await this.storage.read(filename);
      if (!readResult.success) {
        throw new Error(`Failed to read document: ${readResult.error}`);
      }

      return {
        uri,
        mimeType: "text/markdown",
        text: readResult.content || ''
      };
    }

    throw new Error(`Unknown resource URI: ${uri}`);
  }
}
