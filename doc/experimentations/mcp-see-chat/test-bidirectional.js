#!/usr/bin/env node

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

class ChatClient {
  constructor(name) {
    this.name = name;
    this.client = null;
    this.transport = null;
    this.messagesReceived = [];
    this.connected = false;
  }

  async connect() {
    console.log(`[${this.name}] Connecting...`);
    
    this.client = new Client({
      name: `chat-client-${this.name}`,
      version: "1.0.0",
    });

    // Set up notification handler to receive messages from other clients
    this.client.onnotification = (notification) => {
      console.log(`[${this.name}] 📨 RECEIVED NOTIFICATION:`, notification);
      this.messagesReceived.push({
        from: 'notification',
        data: notification,
        timestamp: new Date().toISOString()
      });
    };

    this.client.onerror = (error) => {
      console.error(`[${this.name}] ❌ Error:`, error);
    };

    this.transport = new StreamableHTTPClientTransport(
      new URL("http://127.0.0.1:3002/mcp")
    );

    try {
      await this.client.connect(this.transport);
      this.connected = true;
      console.log(`[${this.name}] ✅ Connected successfully!`);
      return true;
    } catch (error) {
      console.error(`[${this.name}] ❌ Failed to connect:`, error.message);
      return false;
    }
  }

  async sendMessage(message) {
    if (!this.connected) {
      console.error(`[${this.name}] ❌ Not connected, cannot send message`);
      return false;
    }

    try {
      console.log(`[${this.name}] 📤 Sending: "${message}"`);
      const result = await this.client.request({
        method: "tools/call",
        params: {
          name: "send-chat-message",
          arguments: {
            message: message,
            sender: this.name
          }
        }
      });
      
      console.log(`[${this.name}] ✅ Message sent successfully`);
      return true;
    } catch (error) {
      console.error(`[${this.name}] ❌ Failed to send message:`, error.message);
      return false;
    }
  }

  async disconnect() {
    if (this.transport) {
      try {
        await this.transport.close();
        this.connected = false;
        console.log(`[${this.name}] 🔌 Disconnected`);
      } catch (error) {
        console.error(`[${this.name}] ❌ Error disconnecting:`, error.message);
      }
    }
  }

  getReceivedMessages() {
    return this.messagesReceived;
  }
}

async function testBidirectionalCommunication() {
  console.log("🧪 TESTING BIDIRECTIONAL COMMUNICATION");
  console.log("=====================================\n");

  // Create 3 clients
  const clients = [
    new ChatClient("Alice"),
    new ChatClient("Bob"), 
    new ChatClient("Charlie")
  ];

  // Step 1: Connect all clients
  console.log("📡 STEP 1: Connecting all clients...\n");
  for (const client of clients) {
    const success = await client.connect();
    if (!success) {
      console.log("❌ Failed to connect all clients, aborting test");
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait between connections
  }

  console.log(`\n✅ All ${clients.length} clients connected!\n`);

  // Step 2: Wait a moment for all connections to stabilize
  console.log("⏳ Waiting for connections to stabilize...\n");
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 3: Each client sends a message
  console.log("💬 STEP 2: Each client sends a message...\n");
  
  await clients[0].sendMessage("Hello everyone, this is Alice!");
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await clients[1].sendMessage("Hi Alice! Bob here, nice to meet you!");
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await clients[2].sendMessage("Hey Alice and Bob! Charlie joining the conversation!");
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Step 4: Wait for messages to propagate
  console.log("\n⏳ Waiting for messages to propagate...\n");
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Step 5: Check what each client received
  console.log("📊 STEP 3: Checking what each client received...\n");
  
  let totalMessagesReceived = 0;
  for (const client of clients) {
    const received = client.getReceivedMessages();
    console.log(`[${client.name}] Received ${received.length} notifications:`);
    received.forEach((msg, index) => {
      console.log(`  ${index + 1}. ${JSON.stringify(msg)}`);
    });
    totalMessagesReceived += received.length;
    console.log();
  }

  // Step 6: Verify bidirectional communication
  console.log("🔍 STEP 4: Analyzing results...\n");
  
  const expectedMessagesPerClient = clients.length - 1; // Each client should receive messages from others
  const expectedTotalMessages = clients.length * expectedMessagesPerClient;
  
  console.log(`Expected: Each client should receive ${expectedMessagesPerClient} messages`);
  console.log(`Expected total: ${expectedTotalMessages} messages across all clients`);
  console.log(`Actual total: ${totalMessagesReceived} messages received`);
  
  let bidirectionalWorking = true;
  for (const client of clients) {
    const received = client.getReceivedMessages().length;
    if (received !== expectedMessagesPerClient) {
      console.log(`❌ ${client.name} received ${received} messages, expected ${expectedMessagesPerClient}`);
      bidirectionalWorking = false;
    } else {
      console.log(`✅ ${client.name} received correct number of messages`);
    }
  }

  // Step 7: Final verdict
  console.log("\n🏁 FINAL RESULT:");
  if (bidirectionalWorking && totalMessagesReceived === expectedTotalMessages) {
    console.log("✅ BIDIRECTIONAL COMMUNICATION IS WORKING!");
    console.log("   All clients can send and receive messages from each other.");
  } else {
    console.log("❌ BIDIRECTIONAL COMMUNICATION IS NOT WORKING PROPERLY");
    console.log("   Messages are not being broadcast to all clients.");
  }

  // Step 8: Cleanup
  console.log("\n🧹 Cleaning up...");
  for (const client of clients) {
    await client.disconnect();
  }

  console.log("\n✅ Test completed!");
}

// Run the test
testBidirectionalCommunication().catch(console.error);
