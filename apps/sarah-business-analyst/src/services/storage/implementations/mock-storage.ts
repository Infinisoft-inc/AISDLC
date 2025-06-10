import { StorageService, DocumentInfo } from "../storage.js";

/**
 * Mock storage for testing and development
 */

export class MockStorage implements StorageService {
  private docs = new Map<string, { content: string; savedAt: Date }>();

  async save(path: string, content: string) {
    this.docs.set(path, { content, savedAt: new Date() });
    return { success: true, url: `mock://${path}` };
  }

  async read(path: string): Promise<{ success: boolean; content?: string; error?: string; }> {
    const document = this.docs.get(path);
    if (!document) {
      return {
        success: false,
        error: `Document not found: ${path}`
      };
    }
    return {
      success: true,
      content: document.content
    };
  }

  async list(): Promise<{ success: boolean; documents?: DocumentInfo[]; error?: string; }> {
    const documents: DocumentInfo[] = Array.from(this.docs.entries()).map(([path, doc]) => ({
      path,
      name: path.split('/').pop() || path,
      size: doc.content.length,
      lastModified: doc.savedAt,
      url: `mock://${path}`
    }));

    return {
      success: true,
      documents
    };
  }

  // Legacy methods for backward compatibility
  get(path: string) {
    const doc = this.docs.get(path);
    return doc?.content;
  }

  getAll() {
    const result = new Map<string, string>();
    this.docs.forEach((doc, path) => {
      result.set(path, doc.content);
    });
    return result;
  }
}
