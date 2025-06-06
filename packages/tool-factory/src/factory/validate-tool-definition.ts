/**
 * Tool Definition Validator
 * SRP: Tool definition validation orchestration only
 */

import type { ToolParameters } from '../types';
import { validateToolName, validateToolDescription, validateRequiredParameters } from '../validators';

/**
 * Validates complete tool definition
 */
export function validateToolDefinition(
  name: string,
  description: string,
  parameters: ToolParameters,
  requiredParameters: string[]
): void {
  validateToolName(name);
  validateToolDescription(description);
  validateRequiredParameters(parameters, requiredParameters);
}
