#!/bin/bash

echo "🔧 Development Setup Helper"
echo "=========================="

echo "📦 Installing additional dev dependencies..."
npm install -D eslint-config-prettier svelte-eslint-parser

echo "🔍 Running type check..."
npm run type-check

echo "🎨 Running formatter..."
npm run format

echo "✅ Development setup complete!"
echo ""
echo "Available commands:"
echo "  npm run dev          - Start development server"
echo "  npm run build        - Build for production"
echo "  npm run type-check   - Check TypeScript types"
echo "  npm run lint         - Lint code"
echo "  npm run format       - Format code"
echo "  npm run tauri dev    - Start Tauri development"
