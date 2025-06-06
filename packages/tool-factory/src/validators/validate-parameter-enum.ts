/**
 * Parameter Enum Validator
 * SRP: Single parameter enum validation only
 */

/**
 * Validates enum constraints for a single parameter
 */
export function validateParameterEnum(
  paramName: string,
  value: any,
  allowedValues: string[]
): void {
  if (!allowedValues.includes(value)) {
    throw new Error(
      `Parameter '${paramName}' must be one of: ${allowedValues.join(', ')}`
    );
  }
}
