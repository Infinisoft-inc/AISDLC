/**
 * Unit Tests for Storage Components
 */


import { MockStorage } from '../../src/services/storage/implementations/mock-storage.js';
import { FileStorage } from '../../src/services/storage/implementations/file-storage.js';

describe('Storage Components', () => {
  describe('MockStorage', () => {
    let storage: MockStorage;

    beforeEach(() => {
      storage = new MockStorage();
    });

    test('should save and retrieve documents', async () => {
      const path = 'test/document.md';
      const content = '# Test Document\n\nThis is a test.';

      const result = await storage.save(path, content);

      expect(result.success).toBe(true);
      expect(result.url).toBe(`mock://${path}`);
      expect(storage.get(path)).toBe(content);
    });

    test('should handle multiple documents', async () => {
      await storage.save('doc1.md', 'Content 1');
      await storage.save('doc2.md', 'Content 2');

      const allDocs = storage.getAll();
      expect(allDocs.size).toBe(2);
      expect(allDocs.get('doc1.md')).toBe('Content 1');
      expect(allDocs.get('doc2.md')).toBe('Content 2');
    });

    test('should not duplicate documents', async () => {
      await storage.save('doc.md', 'Original');
      await storage.save('doc.md', 'Updated');

      expect(storage.get('doc.md')).toBe('Updated');
      expect(storage.getAll().size).toBe(1);
    });
  });

  describe('FileStorage', () => {
    let storage: FileStorage;
    const testBasePath = './test-output';

    beforeEach(() => {
      storage = new FileStorage(testBasePath);
    });

    test('should create file storage with base path', () => {
      expect(storage).toBeInstanceOf(FileStorage);
    });

    test('should return success for file save', async () => {
      const result = await storage.save('test.md', '# Test');

      expect(result.success).toBe(true);
      expect(result.url).toContain('file://');
      expect(result.url).toContain('test.md');
    });

    test('should handle save errors gracefully', async () => {
      // Test with invalid path
      const result = await storage.save('\0invalid', 'content');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
