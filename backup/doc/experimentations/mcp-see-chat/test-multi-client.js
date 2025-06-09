#!/usr/bin/env node

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const EventSourceLib = require('eventsource');
// Make EventSource available globally for the MCP SDK
global.EventSource = EventSourceLib.EventSource;

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function createTestClient(clientName) {
  console.log(`🔌 Creating ${clientName} client...`);
  
  const client = new Client(
    {
      name: `test-client-${clientName}`,
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  const transport = new SSEClientTransport(
    new URL("http://127.0.0.1:3001/sse")
  );

  try {
    await client.connect(transport);
    console.log(`✅ ${clientName} connected successfully!`);
    
    // Test sending a message
    const result = await client.request(
      {
        method: "tools/call",
        params: {
          name: "send-chat-message",
          arguments: {
            message: `Hello from ${clientName}! Testing multi-client chat.`,
            sender: clientName
          }
        }
      },
      {}
    );
    
    console.log(`📤 ${clientName} sent message:`, result);
    
    return { client, transport, name: clientName };
  } catch (error) {
    console.error(`❌ ${clientName} failed to connect:`, error.message);
    return null;
  }
}

async function testMultiClient() {
  console.log("🧪 Testing Multi-Client Chat Room...\n");
  
  // Create multiple clients
  const clients = [];
  
  const client1 = await createTestClient("architect");
  if (client1) clients.push(client1);
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const client2 = await createTestClient("developer");
  if (client2) clients.push(client2);
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const client3 = await createTestClient("tester");
  if (client3) clients.push(client3);
  
  console.log(`\n📊 Total connected clients: ${clients.length}`);
  
  // Test cross-client messaging
  if (clients.length >= 2) {
    console.log("\n💬 Testing cross-client messaging...");
    
    for (let i = 0; i < clients.length; i++) {
      const sender = clients[i];
      const message = `Message ${i + 1} from ${sender.name} to all clients`;
      
      try {
        const result = await sender.client.request(
          {
            method: "tools/call",
            params: {
              name: "send-chat-message",
              arguments: {
                message: message,
                sender: sender.name
              }
            }
          },
          {}
        );
        console.log(`✅ ${sender.name} sent: "${message}"`);
        console.log(`   Response:`, result.content[0].text);
      } catch (error) {
        console.error(`❌ ${sender.name} failed to send message:`, error.message);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Keep clients connected for a bit to see if they receive messages
  console.log("\n⏳ Keeping clients connected for 5 seconds to observe...");
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Cleanup
  console.log("\n🧹 Cleaning up clients...");
  for (const client of clients) {
    try {
      await client.client.close();
      console.log(`✅ ${client.name} disconnected`);
    } catch (error) {
      console.error(`❌ Error disconnecting ${client.name}:`, error.message);
    }
  }
  
  console.log("\n✅ Multi-client test completed!");
}

// Run the test
testMultiClient().catch(console.error);
