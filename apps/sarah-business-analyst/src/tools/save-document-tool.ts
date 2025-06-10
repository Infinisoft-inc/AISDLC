/**
 * Save Document Tool - Single Responsibility
 * Only handles saving documents
 */

import { DocumentStorage } from '../services/storage/implementations/document-storage.js';
import { ProjectContext } from './set-project-tool.js';

export class SaveDocumentTool {
  constructor(
    private documentSaver: DocumentStorage,
    private getProjectContext: () => ProjectContext | undefined
  ) {}

  async execute(args: { document: string; projectName: string; fileName?: string }) {
    const { document, projectName, fileName } = args;
    
    try {
      const context = this.getProjectContext();
      if (!context) {
        throw new Error('Project context not set. Please use the set-project tool first.');
      }

      // Generate file path
      const filePath = `${context.docsPath}/${fileName || 'document.md'}`;

      // Save document
      const result = await this.documentSaver.save(filePath, document);

      if (!result.success) {
        throw new Error(result.error || 'Failed to save document');
      }

      // Determine storage type for user feedback
      const storageType = result.url && result.url.startsWith('https://github.com') ? 'GitHub' :
                         result.url && result.url.startsWith('mock://') ? 'Mock Storage (NOT saved to GitHub)' :
                         'Local Storage';

      const storageIcon = storageType === 'GitHub' ? '✅' :
                         storageType.includes('Mock') ? '⚠️' :
                         '📁';

      return {
        content: [{
          type: "text",
          text: `${storageIcon} **Document Saved to ${storageType}**\n\n**Project:** ${projectName}\n**File:** ${fileName || 'document.md'}\n**Location:** ${filePath}\n**Repository:** ${context.organization}/${context.githubRepo}\n${result.url ? `**URL:** ${result.url}` : ''}\n\n${storageType.includes('Mock') ? '⚠️ **Note:** This document was saved to mock storage only and is NOT available in GitHub. Check your GitHub credentials to enable real GitHub storage.\n\n' : ''}**Document Preview:**\n${document.substring(0, 300)}${document.length > 300 ? '...' : ''}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `❌ **Failed to Save Document**\n\nError: ${error instanceof Error ? error.message : String(error)}\n\nPlease ensure:\n1. Project context is set using set-project tool\n2. Document content is valid`
        }]
      };
    }
  }

  getSchema() {
    return {
      name: "save-document",
      description: "Save generated document to storage",
      inputSchema: {
        type: "object",
        properties: {
          document: { type: "string", description: "The generated document content" },
          projectName: { type: "string", description: "Name of the project" },
          fileName: { type: "string", description: "File name (optional)", default: "document.md" }
        },
        required: ["document", "projectName"]
      }
    };
  }
}
