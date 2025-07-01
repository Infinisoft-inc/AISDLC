/**
 * Configuration validation functions
 */

import type { ReadonlyConfig } from '../types/core.js';
import type { ValidationResult, ValidationError } from '../types/result.js';

export const validateConfig = (config: ReadonlyConfig): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate transport type
  if (!['stdio', 'sse'].includes(config.transport.type)) {
    errors.push({
      path: 'transport.type',
      message: 'Transport type must be one of: stdio, sse',
      value: config.transport.type
    });
  }

  // Validate conversation history limit
  if (config.features.resources.conversationHistoryLimit < 1) {
    errors.push({
      path: 'features.resources.conversationHistoryLimit',
      message: 'Conversation history limit must be at least 1',
      value: config.features.resources.conversationHistoryLimit
    });
  }

  // Validate required fields
  if (!config.agent.name.trim()) {
    errors.push({
      path: 'agent.name',
      message: 'Agent name is required',
      value: config.agent.name
    });
  }

  return errors.length === 0
    ? { valid: true, data: config }
    : { valid: false, errors };
};
