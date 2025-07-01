/**
 * Functional URI builder service composition
 */

import { buildMemoryUri } from '../uri/build-memory.js';
import { buildConversationUri } from '../uri/build-conversation.js';
import { buildTemplateUri } from '../uri/build-template.js';
import { buildCurrentProjectUri } from '../uri/build-project.js';

export interface UriBuilderService {
  readonly memory: (key: string) => string;
  readonly conversations: (id: string) => string;
  readonly templates: (name: string) => string;
  readonly currentProject: () => string;
}

export const createUriBuilderService = (prefix: string): UriBuilderService => ({
  memory: (key: string) => buildMemoryUri(prefix, key),
  conversations: (id: string) => buildConversationUri(prefix, id),
  templates: (name: string) => buildTemplateUri(prefix, name),
  currentProject: () => buildCurrentProjectUri(prefix)
});
