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
