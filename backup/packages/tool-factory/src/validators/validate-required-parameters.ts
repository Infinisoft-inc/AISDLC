/**
 * Required Parameters Validator
 * SRP: Parameter existence validation only
 */

import type { ToolParameters } from '../types';

/**
 * Validates required parameters exist in parameters definition
 */
export function validateRequiredParameters(
  parameters: ToolParameters,
  requiredParameters: string[]
): void {
  for (const param of requiredParameters) {
    if (!(param in parameters)) {
      throw new Error(`Required parameter '${param}' not found in parameters`);
    }
  }
}
