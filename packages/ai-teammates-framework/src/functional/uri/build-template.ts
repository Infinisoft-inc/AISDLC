/**
 * Build template URI function
 */

export const buildTemplateUri = (prefix: string, name: string): string =>
  `${prefix}://templates/${encodeURIComponent(name)}`;
