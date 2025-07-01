/**
 * Build memory URI function
 */

export const buildMemoryUri = (prefix: string, key: string): string =>
  `${prefix}://memory/${encodeURIComponent(key)}`;
