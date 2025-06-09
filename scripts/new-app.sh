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
