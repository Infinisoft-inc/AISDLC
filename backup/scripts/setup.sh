#!/bin/bash

# AI-SDLC Teammate Setup Script
# Quick setup for the entire AI teammate ecosystem

set -e

echo "🚀 AI-SDLC Teammate Ecosystem Setup"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "setup-ai-teammates.ts" ]; then
    echo "❌ Error: Please run this script from the scripts directory"
    echo "   cd scripts && ./setup.sh"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🤖 Setting up AI teammates..."
echo ""

# Run the setup script
npm run setup-teammates

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Import MCP config files from mcp-servers/*/config/"
echo "2. Test teammates by running their MCP servers"
echo "3. Start using AI-SDLC methodology!"
echo ""
echo "📚 Documentation: scripts/README.md"
echo ""
