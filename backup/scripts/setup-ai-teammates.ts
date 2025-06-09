#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// AI Teammate Definitions
const AI_TEAMMATES = [
  {
    folderName: 'ai-business-analyst',
    name: 'Alex',
    title: 'AI Business Analyst',
    description: 'Conducts business case discovery and requirements gathering',
    tone: 'structured and inquisitive',
    avatar: '📊',
    voice: 'alex-voice-id',
    memory_scope: 'business-analysis',
    phase: 'Phase 1.1',
    existing: true // Already created
  },
  {
    folderName: 'ai-architect',
    name: 'Leo',
    title: 'AI Architect',
    description: 'Designs domain-driven architecture and system specifications',
    tone: 'technical and systematic',
    avatar: '🏗️',
    voice: 'leo-voice-id',
    memory_scope: 'architecture-design',
    phase: 'Phase 1.3'
  },
  {
    folderName: 'ai-functional-analyst',
    name: 'Maya',
    title: 'AI Functional Analyst',
    description: 'Creates detailed functional requirements specifications',
    tone: 'detail-oriented and precise',
    avatar: '🔍',
    voice: 'maya-voice-id',
    memory_scope: 'functional-analysis',
    phase: 'Phase 2.1'
  },
  {
    folderName: 'ai-lead-developer',
    name: 'Sam',
    title: 'AI Lead Developer',
    description: 'Creates implementation plans and technical task breakdowns',
    tone: 'pragmatic and solution-focused',
    avatar: '👨‍💻',
    voice: 'sam-voice-id',
    memory_scope: 'implementation-planning',
    phase: 'Phase 2.2'
  },
  {
    folderName: 'ai-project-manager',
    name: 'Jordan',
    title: 'AI Project Manager',
    description: 'Manages work breakdown structure and GitHub project organization',
    tone: 'organized and collaborative',
    avatar: '📋',
    voice: 'jordan-voice-id',
    memory_scope: 'project-management',
    phase: 'Phase 2.3'
  },
  {
    folderName: 'ai-developer',
    name: 'Casey',
    title: 'AI Developer',
    description: 'Implements code, creates tests, and manages pull requests',
    tone: 'efficient and quality-focused',
    avatar: '⚡',
    voice: 'casey-voice-id',
    memory_scope: 'code-development',
    phase: 'Phase 2.4'
  },
  {
    folderName: 'ai-qa-engineer',
    name: 'Riley',
    title: 'AI QA Engineer',
    description: 'Conducts quality assurance testing and validation',
    tone: 'thorough and quality-driven',
    avatar: '🧪',
    voice: 'riley-voice-id',
    memory_scope: 'quality-assurance',
    phase: 'Phase 3.1'
  },
  {
    folderName: 'ai-devops-engineer',
    name: 'Taylor',
    title: 'AI DevOps Engineer',
    description: 'Handles deployment and delivery processes (experimental)',
    tone: 'reliable and automation-focused',
    avatar: '🚀',
    voice: 'taylor-voice-id',
    memory_scope: 'devops-deployment',
    phase: 'Phase 3.2'
  }
];

const BASE_DIR = path.join(process.cwd(), '..', 'mcp-servers');
const TEMPLATE_DIR = path.join(BASE_DIR, 'ai-business-analyst');

function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyDirectory(src: string, dest: string, exclude: string[] = []) {
  ensureDirectoryExists(dest);
  
  const items = fs.readdirSync(src);
  
  for (const item of items) {
    if (exclude.includes(item)) continue;
    
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      copyDirectory(srcPath, destPath, exclude);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function generatePersonaConfig(teammate: any): string {
  return JSON.stringify({
    name: teammate.name,
    title: teammate.title,
    description: teammate.description,
    tone: teammate.tone,
    avatar: teammate.avatar,
    voice: teammate.voice,
    memory_scope: teammate.memory_scope,
    phase: teammate.phase,
    created_at: new Date().toISOString(),
    version: "1.0.0"
  }, null, 2);
}

function generateMcpConfig(teammate: any): string {
  return JSON.stringify({
    [teammate.folderName]: {
      command: "wsl.exe",
      args: [
        "bash",
        "-c",
        `"cd /home/agent2/AISDLC/mcp-servers/${teammate.folderName}/config && ./run.sh"`
      ],
      env: {}
    }
  }, null, 2);
}

function generateRunScript(): string {
  return `#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" && pwd )"
echo "Script directory: $SCRIPT_DIR"

# Change to the parent directory (root of the project)
cd "$SCRIPT_DIR/.."
PROJECT_DIR="$(pwd)"
echo "Project directory: $PROJECT_DIR"

# Source NVM to ensure the correct Node environment is set up
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"  # This loads nvm

# Read values from .env file if it exists
if [ -f "$PROJECT_DIR/.env" ]; then
  echo "Reading configuration from .env file..."
  export $(grep -v "^#" "$PROJECT_DIR/.env" | xargs)
else
  echo "Warning: .env file not found in $PROJECT_DIR"
  echo "Using default configuration."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build the TypeScript code
echo "Building TypeScript code..."
npm run build

# Run the MCP server
echo "Starting AI Teammate MCP Server with stdio..."
npm start
`;
}

function updatePackageJson(teammateDir: string, teammate: any) {
  const packageJsonPath = path.join(teammateDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  packageJson.name = `${teammate.folderName}-mcp`;
  packageJson.description = `${teammate.title} MCP Server for AI-SDLC methodology`;
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

function setupTeammate(teammate: any) {
  if (teammate.existing) {
    console.log(`⏭️  Skipping ${teammate.name} (${teammate.folderName}) - already exists`);
    return;
  }
  
  console.log(`🔧 Setting up ${teammate.name} (${teammate.folderName})...`);
  
  const teammateDir = path.join(BASE_DIR, teammate.folderName);
  const configDir = path.join(teammateDir, 'config');
  
  // Copy template directory
  copyDirectory(TEMPLATE_DIR, teammateDir, ['node_modules', 'dist', '.git']);
  
  // Create config directory
  ensureDirectoryExists(configDir);
  
  // Generate persona.json
  const personaPath = path.join(configDir, 'persona.json');
  fs.writeFileSync(personaPath, generatePersonaConfig(teammate));
  
  // Generate MCP config
  const mcpConfigPath = path.join(configDir, `mcp-config-${teammate.folderName}.json`);
  fs.writeFileSync(mcpConfigPath, generateMcpConfig(teammate));
  
  // Generate run.sh
  const runScriptPath = path.join(configDir, 'run.sh');
  fs.writeFileSync(runScriptPath, generateRunScript());
  
  // Make run.sh executable
  try {
    execSync(`chmod +x "${runScriptPath}"`);
  } catch (error) {
    console.log(`⚠️  Could not set executable permissions for ${runScriptPath}`);
  }
  
  // Update package.json
  updatePackageJson(teammateDir, teammate);
  
  console.log(`✅ ${teammate.name} (${teammate.folderName}) ready!`);
  console.log(`📥 Import config: ${mcpConfigPath}`);
}

function generateConsolidatedMcpConfig() {
  const mcpConfigPath = path.join(BASE_DIR, 'ai-sdlc-teammates-mcp-config.json');

  const mcpServers = AI_TEAMMATES.map(teammate => ({
    name: teammate.folderName,
    command: "wsl.exe",
    args: [
      "bash",
      "-c",
      `"cd /home/agent2/AISDLC/mcp-servers/${teammate.folderName}/config && ./run.sh"`
    ],
    env: {}
  }));

  const consolidatedConfig = {
    mcpServers: mcpServers
  };

  fs.writeFileSync(mcpConfigPath, JSON.stringify(consolidatedConfig, null, 2));
  console.log(`🔧 Consolidated MCP config created: ${mcpConfigPath}`);
  return mcpConfigPath;
}

function generateTeammateRegistry() {
  const registryPath = path.join(BASE_DIR, 'registry.json');
  const registry = {
    version: "1.0.0",
    created_at: new Date().toISOString(),
    teammates: AI_TEAMMATES.map(teammate => ({
      name: teammate.name,
      folderName: teammate.folderName,
      title: teammate.title,
      phase: teammate.phase,
      avatar: teammate.avatar,
      status: teammate.existing ? 'existing' : 'created'
    }))
  };

  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  console.log(`📋 Teammate registry created: ${registryPath}`);
}

function main() {
  console.log('🚀 AI-SDLC Teammate Setup Starting...\n');
  
  // Ensure base directory exists
  ensureDirectoryExists(BASE_DIR);
  
  // Check if template exists
  if (!fs.existsSync(TEMPLATE_DIR)) {
    console.error(`❌ Template directory not found: ${TEMPLATE_DIR}`);
    console.error('Please ensure ai-business-analyst MCP server exists first.');
    process.exit(1);
  }
  
  // Setup each teammate
  for (const teammate of AI_TEAMMATES) {
    setupTeammate(teammate);
  }
  
  // Generate registry and consolidated config
  generateTeammateRegistry();
  const consolidatedConfigPath = generateConsolidatedMcpConfig();

  console.log('\n🎉 AI Teammate Setup Complete!');
  console.log('\n📋 Available AI Teammates:');

  AI_TEAMMATES.forEach(teammate => {
    console.log(`${teammate.avatar} ${teammate.name} - ${teammate.title} (${teammate.phase})`);
  });

  console.log('\n🔧 Next Steps:');
  console.log(`1. Import the consolidated MCP config: ${consolidatedConfigPath}`);
  console.log('2. Test each teammate by calling their respective servers');
  console.log('3. Start using the AI-SDLC methodology with your new team!');
}

// Run main function if this is the entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { AI_TEAMMATES, setupTeammate, generateTeammateRegistry };
