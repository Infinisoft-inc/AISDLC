#!/usr/bin/env node

/**
 * Jordan Project Manager - Clean SRP Architecture
 * Single responsibility: Application entry point and server startup
 */

// Load environment variables first
import { config } from 'dotenv';
import { JordanMCPServer } from './server/mcpServer.js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory of this file and resolve .env path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../.env');

config({ path: envPath });

// Start the server
const server = new JordanMCPServer();
server.run().catch(console.error);
