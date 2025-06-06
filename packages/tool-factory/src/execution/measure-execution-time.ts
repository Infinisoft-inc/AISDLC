/**
 * Execution Time Measurer
 * SRP: Execution timing only
 */

/**
 * Measures execution time of a function
 */
export async function measureExecutionTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; executionTime: number }> {
  const startTime = Date.now();
  const result = await fn();
  const executionTime = Date.now() - startTime;
  
  return { result, executionTime };
}
