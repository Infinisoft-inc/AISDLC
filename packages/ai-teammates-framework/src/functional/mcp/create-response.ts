/**
 * Create MCP response function
 */

import type { ReadonlyMCPResponse, ReadonlyMCPContent } from '../types/mcp.js';

export const createMCPResponse = (
  text: string,
  isError = false
): ReadonlyMCPResponse => ({
  content: [{
    type: 'text',
    text
  }],
  isError
});
