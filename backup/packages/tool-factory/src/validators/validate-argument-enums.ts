/**
 * Argument Enums Validator
 * SRP: All enum validations orchestration only
 */

import type { ToolParameters } from '../types';
import { validateParameterEnum } from './validate-parameter-enum';

/**
 * Validates all enum constraints in arguments
 */
export function validateArgumentEnums<TArgs>(
  args: TArgs,
  parameters: ToolParameters
): void {
  for (const [paramName, paramDef] of Object.entries(parameters)) {
    if (paramName in (args as any) && paramDef.enum) {
      const value = (args as any)[paramName];
      validateParameterEnum(paramName, value, paramDef.enum);
    }
  }
}
