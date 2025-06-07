#!/bin/bash

# AI Teammate MCP Server Runner
# This script starts the AI teammate MCP server

TEAMMATE_DIR="$(dirname "$(dirname "$(realpath "$0")")")"
TEAMMATE_NAME="$(basename "$TEAMMATE_DIR")"

echo "Starting $TEAMMATE_NAME MCP Server..."
echo "Directory: $TEAMMATE_DIR"

# Ensure the index.js file is executable
chmod +x "$TEAMMATE_DIR/dist/index.js"

# Start the MCP server
cd "$TEAMMATE_DIR"
node dist/index.js

echo "$TEAMMATE_NAME MCP Server stopped."
