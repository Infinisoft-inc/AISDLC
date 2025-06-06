/**
 * Tool Description Validator
 * SRP: Description validation only
 */

/**
 * Validates tool description is not empty
 */
export function validateToolDescription(description: string): void {
  if (!description || description.trim().length === 0) {
    throw new Error('Tool description cannot be empty');
  }
}
