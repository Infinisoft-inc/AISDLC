/**
 * Required Arguments Validator
 * SRP: Argument presence validation only
 */

/**
 * Validates required arguments are present
 */
export function validateRequiredArguments<TArgs>(
  args: TArgs,
  requiredParameters: string[]
): void {
  for (const param of requiredParameters) {
    if (!(param in (args as any))) {
      throw new Error(`Required argument '${param}' is missing`);
    }
  }
}
