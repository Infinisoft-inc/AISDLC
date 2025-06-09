#!/bin/bash
set -e

echo "🔐 Setting up local protection to enforce pnpm-only..."

# Ensure scripts/npm and scripts/yarn exist
if [[ ! -f scripts/npm || ! -f scripts/yarn ]]; then
  echo "❌ Required stub scripts not found in ./scripts (npm/yarn). Aborting."
  exit 1
fi

# Create tools/bin if it doesn't exist
mkdir -p tools/bin

# Link existing override scripts
ln -sf "$(pwd)/scripts/npm" tools/bin/npm
ln -sf "$(pwd)/scripts/yarn" tools/bin/yarn
chmod +x tools/bin/npm tools/bin/yarn

# Create or overwrite .envrc for direnv
cat << EOF > .envrc
export PATH="$(pwd)/tools/bin:\$PATH"
EOF

# Prompt trust
echo "🧪 Checking for direnv..."
if command -v direnv &>/dev/null; then
  echo "✅ direnv found. Run 'direnv allow' to enable local override of npm and yarn."
else
 #sudo apt install direnv
  echo "⚠️ direnv not found. Install it from https://direnv.net to enable PATH protection."
fi

echo "🛡️ Workspace now protected. 'npm' and 'yarn' will be blocked once 'direnv allow' is run."
