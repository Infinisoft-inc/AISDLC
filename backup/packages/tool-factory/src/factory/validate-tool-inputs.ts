/**
 * Tool Inputs Validator
 * SRP: Input validation orchestration only
 */

import type { ToolParameters } from '../types';
import { validateRequiredArguments, validateArgumentEnums } from '../validators';

/**
 * Validates tool inputs
 */
export function validateToolInputs<TArgs>(
  args: TArgs,
  parameters: ToolParameters,
  requiredParameters: string[]
): void {
  validateRequiredArguments(args, requiredParameters);
  validateArgumentEnums(args, parameters);
}
