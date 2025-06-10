/**
 * Pure Storage Interface - No implementation details
 */

export interface DocumentInfo {
  path: string;
  name: string;
  size?: number;
  lastModified?: Date;
  url?: string;
}

export interface StorageService {
  save(path: string, content: string): Promise<{ success: boolean; url?: string; error?: string; }>;
  read(path: string): Promise<{ success: boolean; content?: string; error?: string; }>;
  list(): Promise<{ success: boolean; documents?: DocumentInfo[]; error?: string; }>;
}


