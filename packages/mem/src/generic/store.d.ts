import type { IMemoryNetwork, ActionResult } from './types';
/**
 * Store data in memory network
 * @param memoryNetwork - Memory network implementation
 * @param key - Storage key
 * @param data - Data to store
 * @returns ActionResult with stored data
 */
export declare function store<T>(memoryNetwork: IMemoryNetwork, key: string, data: T): Promise<ActionResult<T>>;
/**
 * Store or update data in memory network
 * @param memoryNetwork - Memory network implementation
 * @param key - Storage key
 * @param data - Data to store/update
 * @returns ActionResult with stored data
 */
export declare function upsert<T>(memoryNetwork: IMemoryNetwork, key: string, data: T): Promise<ActionResult<T>>;
//# sourceMappingURL=store.d.ts.map