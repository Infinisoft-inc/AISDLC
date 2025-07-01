/**
 * Handle MCP resource read function
 */

import type { ReadonlyMCPResourceRequest, ReadonlyMCPResponse } from '../types/mcp.js';
import type { ReadonlyResourceDefinition } from '../types/plugin.js';
import { createMCPResponse } from './create-response.js';
import { isSuccess } from '../utils/result.js';

export const handleResourceRead = async (
  request: ReadonlyMCPResourceRequest,
  resources: readonly ReadonlyResourceDefinition[]
): Promise<ReadonlyMCPResponse> => {
  const uri = request.params?.uri;

  if (!uri) {
    return createMCPResponse('Resource URI is required', true);
  }

  const resource = resources.find(r => r.uri === uri);
  if (!resource) {
    return createMCPResponse(`Resource '${uri}' not found`, true);
  }

  try {
    const result = await resource.handler(uri);
    
    if (isSuccess(result)) {
      return createMCPResponse(result.data);
    } else {
      return createMCPResponse(result.error, true);
    }
  } catch (error) {
    return createMCPResponse(`Resource read failed: ${String(error)}`, true);
  }
};
