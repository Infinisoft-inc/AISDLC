import { StorageService, DocumentInfo } from '../storage.js';

/**
 * File system storage implementation
 */

export class FileStorage implements StorageService {
  constructor(private basePath: string = './output') { }

  async save(path: string, content: string) {
    try {
      const fs = await import('fs/promises');
      const pathModule = await import('path');
      const fullPath = pathModule.join(this.basePath, path);
      await fs.mkdir(pathModule.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, 'utf-8');
      return { success: true, url: `file://${fullPath}` };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  async read(path: string): Promise<{ success: boolean; content?: string; error?: string; }> {
    try {
      const fs = await import('fs/promises');
      const pathModule = await import('path');
      const fullPath = pathModule.join(this.basePath, path);
      const content = await fs.readFile(fullPath, 'utf-8');
      return { success: true, content };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  async list(): Promise<{ success: boolean; documents?: DocumentInfo[]; error?: string; }> {
    try {
      const fs = await import('fs/promises');
      const pathModule = await import('path');

      const documents: DocumentInfo[] = [];

      async function scanDirectory(dirPath: string, relativePath: string = '') {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
          const entryPath = pathModule.join(dirPath, entry.name);
          const relativeEntryPath = pathModule.join(relativePath, entry.name);

          if (entry.isFile()) {
            const stats = await fs.stat(entryPath);
            documents.push({
              path: relativeEntryPath,
              name: entry.name,
              size: stats.size,
              lastModified: stats.mtime,
              url: `file://${entryPath}`,
            });
          } else if (entry.isDirectory()) {
            await scanDirectory(entryPath, relativeEntryPath);
          }
        }
      }

      await scanDirectory(this.basePath);

      return { success: true, documents };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
}
