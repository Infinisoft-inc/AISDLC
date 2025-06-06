#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client with service role key to bypass RLS
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define tool schemas
const SendMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  conversation_id: z.string().optional(),
});

const GetMessagesSchema = z.object({
  conversation_id: z.string().optional(),
  limit: z.number().optional().default(50),
});

// Create the server
const server = new Server(
  {
    name: 'mcp-realtime-experiment',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Set up real-time subscription for messages
let messageSubscription: any = null;
let pollingInterval: NodeJS.Timeout | null = null;
let lastProcessedMessageId = 0;

// Feature flags for different injection methods
const ENABLE_REALTIME_SUBSCRIPTION = process.env.ENABLE_REALTIME === 'true';
const ENABLE_POLLING_INJECTION = process.env.ENABLE_POLLING === 'true';
const POLLING_INTERVAL_MS = parseInt(process.env.POLLING_INTERVAL_MS || '2000');

async function logInjectionAttempt(messageId: number, eventType: string, method: string, success: boolean, error?: string, payload?: any) {
  try {
    await supabase
      .from('injection_logs')
      .insert([{
        event_type: eventType,
        message_id: messageId,
        payload: payload,
        injection_method: method,
        injection_success: success,
        error_message: error || null
      }]);
  } catch (logError) {
    console.error('Failed to log injection attempt:', logError);
  }
}

async function performInjection(messageData: any, eventType: string, method: string) {
  const messageId = messageData?.id;
  const message = {
    type: 'realtime_update',
    event: eventType,
    data: messageData,
    timestamp: new Date().toISOString(),
    experiment: 'mcp-stdio-injection',
    injection_method: method
  };

  const jsonMessage = JSON.stringify(message);

  try {
    switch (method) {
      case 'console.log':
        console.log(`REALTIME_INJECTION: ${jsonMessage}`);
        break;
      case 'console.error':
        console.error(`REALTIME_EVENT: ${jsonMessage}`);
        break;
      case 'process.stdout':
        process.stdout.write(`DIRECT_STDOUT: ${jsonMessage}\n`);
        break;
      case 'process.stderr':
        process.stderr.write(`DIRECT_STDERR: ${jsonMessage}\n`);
        break;
    }
    await logInjectionAttempt(messageId, eventType, method, true, undefined, message);
    return true;
  } catch (error) {
    await logInjectionAttempt(messageId, eventType, method, false, error instanceof Error ? error.message : String(error), message);
    return false;
  }
}

async function pollForNewMessages() {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .gt('id', lastProcessedMessageId)
      .order('id', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Polling error:', error);
      return;
    }

    if (data && data.length > 0) {
      console.error(`POLLING: Found ${data.length} new messages to inject`);

      for (const messageData of data) {
        // Inject using all 4 methods
        await performInjection(messageData, 'INSERT', 'console.log');
        await performInjection(messageData, 'INSERT', 'console.error');
        await performInjection(messageData, 'INSERT', 'process.stdout');
        await performInjection(messageData, 'INSERT', 'process.stderr');

        // Update last processed ID
        lastProcessedMessageId = messageData.id;
      }

      // Log the polling event
      await logInjectionAttempt(data[data.length - 1].id, 'POLLING_CYCLE', 'polling_completed', true, undefined, {
        messages_found: data.length,
        last_processed_id: lastProcessedMessageId,
        polling_time: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Polling cycle error:', error);
    await logInjectionAttempt(0, 'POLLING_CYCLE', 'polling_error', false, error instanceof Error ? error.message : String(error));
  }
}

function setupPollingInjection() {
  if (ENABLE_POLLING_INJECTION) {
    console.error(`Starting polling injection every ${POLLING_INTERVAL_MS}ms`);
    pollingInterval = setInterval(pollForNewMessages, POLLING_INTERVAL_MS);
  }
}

function setupRealtimeSubscription() {
  if (!ENABLE_REALTIME_SUBSCRIPTION) {
    console.error('Real-time subscription disabled by feature flag');
    return;
  }
  messageSubscription = supabase
    .channel('messages')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'messages' },
      async (payload) => {
        const messageData = payload.new || payload.old;
        const messageId = (messageData as any)?.id;
        const eventType = payload.eventType;

        // This is where we inject data into STDIO
        const message = {
          type: 'realtime_update',
          event: eventType,
          data: messageData,
          timestamp: new Date().toISOString(),
          experiment: 'mcp-stdio-injection'
        };

        const jsonMessage = JSON.stringify(message);

        // Method 1: EXPERIMENTAL - Inject unsolicited data into STDIO stream
        try {
          console.log(`REALTIME_INJECTION: ${jsonMessage}`);
          await logInjectionAttempt(messageId, eventType, 'console.log', true, undefined, message);
        } catch (error) {
          await logInjectionAttempt(messageId, eventType, 'console.log', false, error instanceof Error ? error.message : String(error), message);
        }

        // Method 2: Write to stderr to avoid interfering with MCP protocol
        try {
          console.error(`REALTIME_EVENT: ${jsonMessage}`);
          await logInjectionAttempt(messageId, eventType, 'console.error', true, undefined, message);
        } catch (error) {
          await logInjectionAttempt(messageId, eventType, 'console.error', false, error instanceof Error ? error.message : String(error), message);
        }

        // Method 3: Try to write directly to process.stdout
        try {
          process.stdout.write(`DIRECT_STDOUT: ${jsonMessage}\n`);
          await logInjectionAttempt(messageId, eventType, 'process.stdout', true, undefined, message);
        } catch (error) {
          await logInjectionAttempt(messageId, eventType, 'process.stdout', false, error instanceof Error ? error.message : String(error), message);
        }

        // Method 4: Try to write directly to process.stderr
        try {
          process.stderr.write(`DIRECT_STDERR: ${jsonMessage}\n`);
          await logInjectionAttempt(messageId, eventType, 'process.stderr', true, undefined, message);
        } catch (error) {
          await logInjectionAttempt(messageId, eventType, 'process.stderr', false, error instanceof Error ? error.message : String(error), message);
        }

        // Log the trigger event itself
        await logInjectionAttempt(messageId, eventType, 'trigger_fired', true, undefined, {
          trigger_time: new Date().toISOString(),
          payload_size: JSON.stringify(messageData).length,
          methods_attempted: ['console.log', 'console.error', 'process.stdout', 'process.stderr']
        });
      }
    )
    .subscribe();
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'send_message',
        description: 'Send a message to the conversation database',
        inputSchema: {
          type: 'object',
          properties: {
            role: {
              type: 'string',
              enum: ['user', 'assistant'],
              description: 'Role of the message sender',
            },
            content: {
              type: 'string',
              description: 'Content of the message',
            },
            conversation_id: {
              type: 'string',
              description: 'Optional conversation ID (will generate if not provided)',
            },
          },
          required: ['role', 'content'],
        },
      },
      {
        name: 'get_messages',
        description: 'Retrieve messages from the conversation database',
        inputSchema: {
          type: 'object',
          properties: {
            conversation_id: {
              type: 'string',
              description: 'Optional conversation ID to filter messages',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of messages to retrieve (default: 50)',
            },
          },
          required: [],
        },
      },
      {
        name: 'get_pending_events',
        description: 'Check for any pending real-time events (polling approach)',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'send_message': {
        const parsed = SendMessageSchema.parse(args);

        const { data, error } = await supabase
          .from('messages')
          .insert([{
            role: parsed.role,
            content: parsed.content,
            conversation_id: parsed.conversation_id || crypto.randomUUID(),
          }])
          .select();

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: `Message sent successfully. ID: ${data[0].id}`,
            },
          ],
        };
      }

      case 'get_messages': {
        const parsed = GetMessagesSchema.parse(args);

        let query = supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(parsed.limit);

        if (parsed.conversation_id) {
          query = query.eq('conversation_id', parsed.conversation_id);
        }

        const { data, error } = await query;

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_pending_events': {
        // This is a placeholder for polling-based approach
        // In a real implementation, you might store events in a queue
        return {
          content: [
            {
              type: 'text',
              text: 'No pending events (polling approach not fully implemented)',
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  // Set up injection mechanisms based on feature flags
  setupRealtimeSubscription();
  setupPollingInjection();

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Real-time Experiment Server running on stdio');
  console.error(`Real-time subscription: ${ENABLE_REALTIME_SUBSCRIPTION ? 'ENABLED' : 'DISABLED'}`);
  console.error(`Polling injection: ${ENABLE_POLLING_INJECTION ? 'ENABLED' : 'DISABLED'}`);
  if (ENABLE_POLLING_INJECTION) {
    console.error(`Polling interval: ${POLLING_INTERVAL_MS}ms`);
  }
}

// Cleanup on exit
process.on('SIGINT', () => {
  if (messageSubscription) {
    messageSubscription.unsubscribe();
  }
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (messageSubscription) {
    messageSubscription.unsubscribe();
  }
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
  process.exit(0);
});

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
