/**
 * Timeout Promise Creator
 * SRP: Timeout creation only
 */

/**
 * Creates timeout promise for tool execution
 */
export function createTimeoutPromise(timeoutMs: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Tool execution timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });
}
