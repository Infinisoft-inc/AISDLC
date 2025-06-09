#!/bin/bash

set -e

MONOREPO_NAME="brainstack-monorepo"

echo "🚀 Scaffolding $MONOREPO_NAME..."

# mkdir "$MONOREPO_NAME"
# cd "$MONOREPO_NAME"

echo "📦 Initializing root package.json with pnpm..."
pnpm init

# Enforce pnpm only
cat << 'EOF' > .npmrc
package-manager=pnpm@latest
EOF

cat << 'EOF' > .npm_prohibited.sh
#!/bin/bash
echo "❌ Forbidden: Use pnpm instead of npm."
exit 1
EOF
chmod +x .npm_prohibited.sh
alias npm="./.npm_prohibited.sh"
alias yarn="./.npm_prohibited.sh"

echo "📁 Creating folders..."
mkdir -p apps packages scripts

echo "📝 Creating pnpm-workspace.yaml..."
cat << EOF > pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
EOF

echo "🛠️ Installing TypeScript..."
pnpm add -D typescript -w

echo "🛠️ Creating tsconfig.base.json..."
cat << EOF > tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Node",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {}
  }
}
EOF

cat << EOF > tsconfig.json
{
  "extends": "./tsconfig.base.json"
}
EOF

echo "📦 Adding scripts to root package.json..."
jq '.scripts = {
  "build-all": "pnpm -r run build",
  "clean-all": "find . -type d -name dist -exec rm -rf {} +",
  "watch-all": "pnpm -r run watch",
  "new-app": "bash scripts/new-app.sh",
  "add-package": "bash scripts/add-package.sh"
}' package.json > package.tmp.json && mv package.tmp.json package.json

echo "🛠️ Creating helper scripts..."

# new-app script
cat << 'EOF' > scripts/new-app.sh
#!/bin/bash
APP_NAME=$1
if [ -z "$APP_NAME" ]; then
  echo "❌ Please provide an app name: pnpm new-app my-app"
  exit 1
fi

APP_DIR="apps/$APP_NAME"
mkdir -p "$APP_DIR/src"

cat << APPJSON > "$APP_DIR/package.json"
{
  "name": "$APP_NAME",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "watch": "tsc -p tsconfig.json --watch"
  }
}
APPJSON

cat << TSCONFIG > "$APP_DIR/tsconfig.json"
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
TSCONFIG

cat << INDEX > "$APP_DIR/src/index.ts"
console.log("👋 Hello from $APP_NAME");
INDEX

echo "✅ App $APP_NAME created!"
EOF

# add-package script
cat << 'EOF' > scripts/add-package.sh
#!/bin/bash
PKG_NAME=$1
if [ -z "$PKG_NAME" ]; then
  echo "❌ Please provide a package name: pnpm add-package shared-utils"
  exit 1
fi

FULL_NAME="@brainstack/$PKG_NAME"
PKG_DIR="packages/$PKG_NAME"
mkdir -p "$PKG_DIR/src"

cat << PKGJSON > "$PKG_DIR/package.json"
{
  "name": "$FULL_NAME",
  "version": "1.0.0",
  "main": "dist/index.js",
  "author": "Martin Ouimet <mouimet@infinisoft.world>",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "watch": "tsc -p tsconfig.json --watch"
  }
}
PKGJSON

cat << TSCONFIG > "$PKG_DIR/tsconfig.json"
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src"]
}
TSCONFIG

cat << INDEX > "$PKG_DIR/src/index.ts"
export const hello = () => console.log("Hello from $FULL_NAME");
INDEX

echo "✅ Package $FULL_NAME created!"
EOF

chmod +x scripts/*.sh

echo "✅ Done! Use 'pnpm new-app <name>' or 'pnpm add-package <name>' to extend your workspace."

