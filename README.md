# Mermaid Diagram Generator

A desktop application built with Tauri + SvelteKit for generating Mermaid diagrams using the mmdc CLI tool.

## Features

- Visual Mermaid diagram editor
- Multiple output formats (PNG, SVG, PDF, JPG)
- File operations (New, Open, Save, Save As)
- Recent files support
- Keyboard shortcuts
- Real-time mmdc status checking

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer).

## Keyboard Shortcuts

- `Ctrl+N`: New file
- `Ctrl+O`: Open file
- `Ctrl+S`: Save file
- `Ctrl+E`: Generate diagram

## Requirements

- Node.js
- Rust
- mmdc (Mermaid CLI) installed globally

## Installation

```bash
npm install
npm run tauri dev
```

## License

This project is licensed under the GNU General Public License v3.0 - see the LICENSE file for details.
