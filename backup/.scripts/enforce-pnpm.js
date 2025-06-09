// .scripts/enforce-pnpm.js
// Enforce pnpm usage and block npm/yarn to prevent lockfile conflicts

const usedPM = process.env.npm_config_user_agent;

if (!usedPM || !usedPM.includes('pnpm')) {
  console.error(`
🚫 This project requires using pnpm.

You are trying to install dependencies using a different package manager:
Detected: ${usedPM || 'unknown package manager'}

✅ Please use: pnpm install

Why pnpm?
- Prevents lockfile conflicts (package-lock.json vs pnpm-lock.yaml)
- Better workspace support for monorepo structure
- Faster and more efficient dependency management
- Consistent team development environment

Installation aborted.
`);
  process.exit(1);
}

console.log('✅ Using pnpm - package manager check passed');
