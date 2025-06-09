#!/usr/bin/env node

// Simple test client for the SSE MCP server
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

async function testSSEClient() {
  console.log("🧪 Testing SSE MCP Client...");
  
  try {
    // Create client
    const client = new Client({
      name: "test-client",
      version: "1.0.0"
    }, {
      capabilities: {}
    });
    
    // Create SSE transport
    const transport = new SSEClientTransport(
      new URL("http://127.0.0.1:3001/sse")
    );
    
    // Connect to server
    console.log("📡 Connecting to SSE server...");
    await client.connect(transport);
    
    console.log("✅ Connected successfully!");
    
    // Test listing prompts
    console.log("📝 Testing prompts...");
    const prompts = await client.listPrompts();
    console.log("Available prompts:", prompts.prompts.map(p => p.name));
    
    // Test @gino prompt
    if (prompts.prompts.find(p => p.name === "@gino")) {
      console.log("🎭 Testing @gino prompt...");
      const ginoPrompt = await client.getPrompt("@gino");
      console.log("Gino prompt response:", ginoPrompt.messages[0].content.text.substring(0, 100) + "...");
    }
    
    // Test listing tools
    console.log("🛠️ Testing tools...");
    const tools = await client.listTools();
    console.log("Available tools:", tools.tools.map(t => t.name));
    
    // Test store-data tool
    if (tools.tools.find(t => t.name === "store-data")) {
      console.log("💾 Testing store-data tool...");
      const result = await client.callTool("store-data", {
        key: "test-sse",
        value: "SSE connection working!"
      });
      console.log("Store result:", result.content[0].text);
    }
    
    // Test listing resources
    console.log("📁 Testing resources...");
    const resources = await client.listResources();
    console.log("Available resources:", resources.resources.map(r => r.name));
    
    // Test reading storage resource
    if (resources.resources.find(r => r.uri === "example://data/storage")) {
      console.log("📊 Testing storage resource...");
      const storage = await client.readResource("example://data/storage");
      console.log("Storage data:", JSON.parse(storage.contents[0].text));
    }
    
    console.log("🎉 All tests completed successfully!");
    
    // Close connection
    await transport.close();
    console.log("👋 Connection closed");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testSSEClient().catch(console.error);
