/**
 * Recall data from memory network
 * @param memoryNetwork - Memory network implementation
 * @param key - Storage key
 * @returns ActionResult with recalled data
 */
export async function recall(memoryNetwork, key) {
    return await memoryNetwork.read(key);
}
//# sourceMappingURL=recall.js.map