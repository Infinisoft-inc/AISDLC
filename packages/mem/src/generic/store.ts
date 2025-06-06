import type { IMemoryNetwork, ActionResult } from './types';

/**
 * Store data in memory network
 * @param memoryNetwork - Memory network implementation
 * @param key - Storage key
 * @param data - Data to store
 * @returns ActionResult with stored data
 */
export async function store<T>(memoryNetwork: IMemoryNetwork, key: string, data: T): Promise<ActionResult<T>> {
  return await memoryNetwork.write(key, data);
}

/**
 * Store or update data in memory network
 * @param memoryNetwork - Memory network implementation
 * @param key - Storage key
 * @param data - Data to store/update
 * @returns ActionResult with stored data
 */
export async function upsert<T>(memoryNetwork: IMemoryNetwork, key: string, data: T): Promise<ActionResult<T>> {
  // Try to read first to see if it exists
  const existing = await memoryNetwork.read<T>(key);

  if (existing.success) {
    // Key exists, update it
    return await memoryNetwork.update(key, data);
  } else {
    // Key doesn't exist, write new
    return await memoryNetwork.write(key, data);
  }
}
