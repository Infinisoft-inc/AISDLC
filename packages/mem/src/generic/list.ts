import type { IMemoryNetwork, ActionResultList } from './types';

/**
 * List all data from memory network
 * @param memoryNetwork - Memory network implementation
 * @returns ActionResultList with all data
 */
export async function list(memoryNetwork: IMemoryNetwork): Promise<ActionResultList<any>> {
  return await memoryNetwork.list();
}
