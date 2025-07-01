/**
 * Build conversation URI function
 */

export const buildConversationUri = (prefix: string, id: string): string =>
  `${prefix}://conversations/${encodeURIComponent(id)}`;
