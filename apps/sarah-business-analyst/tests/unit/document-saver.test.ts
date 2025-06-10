/**
 * Unit Tests for Document Saver
 */

import { DocumentStorage } from '../../src/services/storage/implementations/document-storage.js';
import { MockStorage } from '../../src/services/storage/implementations/mock-storage.js';

describe('DocumentSaver', () => {
  let storage: MockStorage;
  let documentSaver: DocumentStorage;

  beforeEach(() => {
    storage = new MockStorage();
    documentSaver = new DocumentStorage(storage);
  });

  test('should save document successfully', async () => {
    const path = 'test/doc.md';
    const content = '# Test Document';
    
    const result = await documentSaver.save(path, content);
    
    expect(result.success).toBe(true);
    expect(result.url).toBe(`mock://${path}`);
    expect(storage.get(path)).toBe(content);
  });

  test('should handle save errors', async () => {
    // Mock storage that fails
    const failingStorage = {
      save: jest.fn().mockResolvedValue({ success: false, error: 'Save failed' })
    };
    
    const saver = new DocumentStorage(failingStorage as any);
    const result = await saver.save('test.md', 'content');
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Save failed');
  });

  test('should handle storage exceptions', async () => {
    // Mock storage that throws
    const throwingStorage = {
      save: jest.fn().mockRejectedValue(new Error('Storage error'))
    };
    
    const saver = new DocumentStorage(throwingStorage as any);
    const result = await saver.save('test.md', 'content');
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Storage error');
  });
});
