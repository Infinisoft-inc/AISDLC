import type { IMemoryNetwork, ActionResult } from './types';

/**
 * Recall data from memory network
 * @param memoryNetwork - Memory network implementation
 * @param key - Storage key
 * @returns ActionResult with recalled data
 */
export async function recall<T>(memoryNetwork: IMemoryNetwork, key: string): Promise<ActionResult<T>> {
  return await memoryNetwork.read<T>(key);
}
