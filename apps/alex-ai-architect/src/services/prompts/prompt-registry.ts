/**
 * Prompt Registry - MCP Prompts for Centralized Prompt Management
 * Coordinates modular prompt files for reusability, consistency, and versioning
 */

import { businessCasePrompts, businessCasePromptMetadata } from './business-case-prompts.js';
import { conversationPrompts, conversationPromptMetadata } from './conversation-prompts.js';
import { documentPrompts, documentPromptMetadata } from './document-prompts.js';
import { requirementsPrompts, requirementsPromptMetadata } from './requirements-prompts.js';

export interface PromptArgument {
  name: string;
  description: string;
  required?: boolean;
}

export interface Prompt {
  name: string;
  description: string;
  arguments?: PromptArgument[];
}

export interface PromptMessage {
  role: "user" | "assistant" | "system";
  content: {
    type: "text";
    text: string;
  };
}

export interface PromptResponse {
  description: string;
  messages: PromptMessage[];
}

export class PromptRegistry {
  private prompts = new Map<string, (args: any) => PromptResponse>();

  constructor() {
    this.registerModularPrompts();
  }

  /**
   * Register prompts from modular prompt files
   */
  private registerModularPrompts(): void {
    // Register business case prompts
    Object.entries(businessCasePrompts).forEach(([name, promptFn]) => {
      this.prompts.set(name, promptFn);
    });

    // Register conversation prompts
    Object.entries(conversationPrompts).forEach(([name, promptFn]) => {
      this.prompts.set(name, promptFn);
    });

    // Register document prompts
    Object.entries(documentPrompts).forEach(([name, promptFn]) => {
      this.prompts.set(name, promptFn);
    });

    // Register requirements prompts
    Object.entries(requirementsPrompts).forEach(([name, promptFn]) => {
      this.prompts.set(name, promptFn);
    });
  }

  /**
   * Register a new prompt
   */
  register(name: string, promptGenerator: (args: any) => PromptResponse): void {
    this.prompts.set(name, promptGenerator);
  }

  /**
   * Get list of available prompts from all modular prompt files
   */
  listPrompts(): Prompt[] {
    return [
      ...businessCasePromptMetadata,
      ...conversationPromptMetadata,
      ...documentPromptMetadata,
      ...requirementsPromptMetadata
    ];
  }

  /**
   * Get prompt by name with arguments
   */
  getPrompt(name: string, args: any = {}): PromptResponse {
    const promptGenerator = this.prompts.get(name);
    if (!promptGenerator) {
      throw new Error(`Prompt '${name}' not found`);
    }
    return promptGenerator(args);
  }
}
