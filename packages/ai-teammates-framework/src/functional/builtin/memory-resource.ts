/**
 * Built-in memory resource
 */

import type { ReadonlyResourceDefinition } from '../types/plugin.js';
import type { Result } from '../types/result.js';
import { success } from '../utils/result.js';
import { createResource } from '../tools/create-resource.js';

const memoryResourceHandler = async (uri: string): Promise<Result<string>> => {
  const key = uri.split('/').pop() || '';
  return success(`Memory resource for key: ${decodeURIComponent(key)}`);
};

export const createMemoryResource = (uriPrefix: string): ReadonlyResourceDefinition =>
  createResource(
    `${uriPrefix}://memory/{key}`,
    'Memory Storage',
    'Access stored memory values',
    'text/plain',
    memoryResourceHandler
  );
