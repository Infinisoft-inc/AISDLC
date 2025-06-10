/**
 * Document Saver - Single Responsibility
 * Only handles saving documents to storage
 */

import { StorageService } from '../storage.js';

export interface SaveResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class DocumentStorage {
  constructor(private storage: StorageService) {}

  async save(path: string, content: string): Promise<SaveResult> {
    try {
      const result = await this.storage.save(path, content);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
