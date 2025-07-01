/**
 * Parse environment variables into configuration
 */

import type { ReadonlyConfig } from '../types/core.js';
import type { Result } from '../types/result.js';
import { success, failure } from '../utils/result.js';

export const parseEnvironmentConfig = (): Result<ReadonlyConfig> => {
  try {
    const config: ReadonlyConfig = {
      agent: {
        name: process.env.AGENT_NAME || 'ai-teammate',
        role: process.env.AGENT_ROLE || 'AI Assistant',
        personality: {
          avatar: process.env.AGENT_AVATAR || '🤖',
          voice: process.env.AGENT_VOICE || 'professional',
          expertise: parseStringArray(process.env.AGENT_EXPERTISE || 'general'),
          communicationStyle: process.env.AGENT_COMMUNICATION_STYLE || 'professional',
          defaultPrompts: parseStringArray(process.env.AGENT_DEFAULT_PROMPTS || '')
        }
      },
      organization: {
        name: process.env.ORG_NAME || '',
        defaultRepo: process.env.ORG_DEFAULT_REPO || '',
        defaultBranch: process.env.ORG_DEFAULT_BRANCH || 'main',
        defaultReviewer: process.env.ORG_DEFAULT_REVIEWER || ''
      },
      integrations: {
        doppler: {
          token: process.env.DOPPLER_TOKEN || '',
          project: process.env.DOPPLER_PROJECT || '',
          environment: process.env.DOPPLER_ENV || 'prd'
        },
        storage: {
          type: process.env.STORAGE_TYPE || 'mock',
          basePath: process.env.STORAGE_BASE_PATH || './output',
          github: {
            owner: process.env.GITHUB_OWNER || process.env.ORG_NAME || '',
            repo: process.env.GITHUB_REPO || process.env.ORG_DEFAULT_REPO || '',
            branch: process.env.GITHUB_BRANCH || process.env.ORG_DEFAULT_BRANCH || 'main'
          }
        },
        github: {
          token: process.env.GITHUB_TOKEN || '',
          organization: process.env.GITHUB_ORGANIZATION || process.env.ORG_NAME || '',
          commentSignature: process.env.GITHUB_COMMENT_SIGNATURE || process.env.AGENT_ROLE || 'AI Assistant'
        }
      },
      transport: {
        type: (process.env.TRANSPORT_TYPE as 'stdio' | 'sse') || 'stdio',
        options: parseTransportOptions()
      },
      features: {
        resources: {
          uriPrefix: process.env.RESOURCE_URI_PREFIX || process.env.AGENT_NAME?.toLowerCase() || 'ai-teammate',
          conversationHistoryLimit: parseInt(process.env.CONVERSATION_HISTORY_LIMIT || '50'),
          enabledResources: parseStringArray(process.env.ENABLED_RESOURCES || 'memory,conversations,templates,documents')
        },
        tools: {
          namePrefix: process.env.TOOL_NAME_PREFIX || process.env.AGENT_NAME?.toLowerCase() || 'ai-teammate',
          enabledTools: parseStringArray(process.env.ENABLED_TOOLS || 'memory,conversations,templates,documents')
        },
        prompts: {
          enabledPrompts: parseStringArray(process.env.ENABLED_PROMPTS || 'memory,conversations,templates,documents'),
          templatePath: process.env.PROMPT_TEMPLATE_PATH || './prompts'
        }
      }
    };

    return success(config);
  } catch (error) {
    return failure(`Failed to parse environment configuration: ${String(error)}`);
  }
};

const parseStringArray = (value: string): readonly string[] =>
  value.split(',').map(s => s.trim()).filter(Boolean);

const parseTransportOptions = (): Record<string, unknown> => {
  if (!process.env.TRANSPORT_OPTIONS) {
    return {};
  }

  try {
    return JSON.parse(process.env.TRANSPORT_OPTIONS) as Record<string, unknown>;
  } catch {
    return {};
  }
};
