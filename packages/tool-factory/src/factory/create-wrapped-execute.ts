/**
 * Wrapped Execute Creator
 * SRP: Execution wrapper creation only
 */

import type { ToolFunction, ToolParameters } from '../types';
import { validateToolInputs } from './validate-tool-inputs';
import { executeWithTimeout, measureExecutionTime, createSuccessResult, createToolEvent } from '../execution';
import { emitToolEvent } from './emit-tool-event';

/**
 * Creates wrapped execution function with error handling
 */
export function createWrappedExecute<TArgs, TResult>(
  toolName: string,
  execute: ToolFunction<TArgs, TResult>,
  parameters: ToolParameters,
  requiredParameters: string[],
  options: { defaultTimeout: number; enableEvents: boolean; validateInputs: boolean }
): ToolFunction<TArgs, TResult> {
  
  return async (args: TArgs): Promise<TResult> => {
    // Validate inputs if enabled
    if (options.validateInputs) {
      validateToolInputs(args, parameters, requiredParameters);
    }

    // Execute with timing and error handling
    const { result, executionTime } = await measureExecutionTime(async () => {
      return executeWithTimeout(execute, args, options.defaultTimeout);
    });

    // Emit event if enabled
    if (options.enableEvents) {
      const event = createToolEvent(
        toolName, 
        args, 
        createSuccessResult(result, executionTime)
      );
      emitToolEvent(event);
    }

    return result;
  };
}
