/**
 * Tool Factory Creator
 * SRP: Factory creation only
 */

import type { ToolDefinition, ToolFunction, ToolParameters, ToolFactoryConfig } from '../types';
import { validateToolDefinition } from './validate-tool-definition';
import { createWrappedExecute } from './create-wrapped-execute';

/**
 * Creates tool factory with configuration
 */
export function createToolFactory(config: ToolFactoryConfig = {}) {
  const {
    defaultTimeout = 30000,
    enableEvents = false,
    validateInputs = true
  } = config;

  return function createTool<TArgs, TResult>(
    name: string,
    description: string,
    parameters: ToolParameters,
    requiredParameters: string[],
    execute: ToolFunction<TArgs, TResult>
  ): ToolDefinition<TArgs, TResult> {
    
    // Validate tool definition
    validateToolDefinition(name, description, parameters, requiredParameters);
    
    // Create wrapped execution function
    const wrappedExecute = createWrappedExecute(
      name,
      execute,
      parameters,
      requiredParameters,
      { defaultTimeout, enableEvents, validateInputs }
    );

    return {
      name,
      description,
      parameters,
      requiredParameters,
      execute: wrappedExecute
    };
  };
}
