import type { IMemoryNetwork, ActionResult, ActionResultList } from './types';

// Shared in-memory storage
const storage = new Map<string, any>();

export const InMemoryNetwork: IMemoryNetwork = {
  async write<T>(key: string, data: T): Promise<ActionResult<T>> {
    try {
      storage.set(key, data);
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async read<T>(key: string): Promise<ActionResult<T>> {
    try {
      const data = storage.get(key);
      if (data === undefined) {
        return {
          success: false,
          error: `Key '${key}' not found`
        };
      }
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async update<T>(key: string, data: T): Promise<ActionResult<T>> {
    try {
      if (!storage.has(key)) {
        return {
          success: false,
          error: `Key '${key}' not found for update`
        };
      }
      storage.set(key, data);
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async delete(key: string): Promise<ActionResult<boolean>> {
    try {
      const deleted = storage.delete(key);
      return {
        success: true,
        data: deleted
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async list(): Promise<ActionResultList<any>> {
    try {
      const items = Array.from(storage.values());
      return {
        success: true,
        data: items,
        totalCount: items.length,
        limit: items.length,
        pageSize: items.length,
        pageNumber: 1
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        totalCount: 0,
        limit: 0,
        pageSize: 0,
        pageNumber: 1
      };
    }
  }
};
