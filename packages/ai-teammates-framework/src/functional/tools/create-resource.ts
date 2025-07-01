/**
 * Create resource definition function
 */

import type { ReadonlyResourceDefinition, ResourceHandler } from '../types/plugin.js';

export const createResource = (
  uri: string,
  name: string,
  description: string,
  mimeType: string,
  handler: ResourceHandler
): ReadonlyResourceDefinition => ({
  uri,
  name,
  description,
  mimeType,
  handler
});
