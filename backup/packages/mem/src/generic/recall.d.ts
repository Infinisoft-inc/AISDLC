import type { IMemoryNetwork, ActionResult } from './types';
/**
 * Recall data from memory network
 * @param memoryNetwork - Memory network implementation
 * @param key - Storage key
 * @returns ActionResult with recalled data
 */
export declare function recall<T>(memoryNetwork: IMemoryNetwork, key: string): Promise<ActionResult<T>>;
//# sourceMappingURL=recall.d.ts.map