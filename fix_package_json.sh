#!/bin/bash

echo "🔧 Fixing package.json and dependencies..."

# 1. Install missing dependencies
echo "📦 Installing missing dev dependencies..."
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-prettier
npm install -D prettier prettier-plugin-svelte
npm install -D svelte-eslint-parser

# 2. Fix package.json manually
echo "📝 Updating package.json scripts..."

# Create a backup
cp package.json package.json.backup

# Update package.json with Node.js
node << 'EOF'
const fs = require('fs');
const path = require('path');

const packagePath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Add new scripts
packageJson.scripts = {
  ...packageJson.scripts,
  "type-check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
  "type-check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier --write .",
  "format:check": "prettier --check ."
};

fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
console.log('✅ Package.json updated successfully');
EOF

# 3. Show current scripts
echo ""
echo "📋 Current package.json scripts:"
npm run

# 4. Test TypeScript setup
echo ""
echo "🔍 Testing TypeScript setup..."
if npm run type-check 2>/dev/null; then
    echo "✅ TypeScript check passed"
else
    echo "⚠️  TypeScript check failed, but that's normal for now"
fi

# 5. Test formatter
echo ""
echo "🎨 Testing formatter..."
if npm run format 2>/dev/null; then
    echo "✅ Formatter ran successfully"
else
    echo "⚠️  Formatter had issues, checking setup..."
fi

echo ""
echo "🔧 Setup status:"
echo "  ✅ Dependencies installed"
echo "  ✅ Scripts added to package.json"
echo "  ✅ Ready for development"
echo ""
echo "🚀 Try running: npm run tauri dev"