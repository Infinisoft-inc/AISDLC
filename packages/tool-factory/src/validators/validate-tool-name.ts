/**
 * Tool Name Validator
 * SRP: Name validation only
 */

/**
 * Validates tool name is not empty
 */
export function validateToolName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new Error('Tool name cannot be empty');
  }
}
