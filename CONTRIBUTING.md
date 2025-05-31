# 🤝 Contributing to Mermaid GUI v2.0

Thank you for your interest in contributing to Mermaid GUI v2.0! We welcome contributions from developers of all skill levels. This guide will help you get started and ensure your contributions can be successfully merged.

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Getting Started](#-getting-started)
- [Development Setup](#️-development-setup)
- [How to Contribute](#-how-to-contribute)
- [Coding Standards](#-coding-standards)
- [Testing Guidelines](#-testing-guidelines)
- [Pull Request Process](#-pull-request-process)
- [Issue Guidelines](#-issue-guidelines)
- [Contact](#-contact)

## 📜 Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

### Our Values
- **Be respectful** - Treat everyone with kindness and respect
- **Be inclusive** - Welcome newcomers and different perspectives
- **Be constructive** - Provide helpful feedback and suggestions
- **Be patient** - Help others learn and grow

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher
- **Rust** 1.75 or higher (install via [rustup](https://rustup.rs/))
- **Git** for version control
- **VS Code** (recommended) with these extensions:
  - Rust Analyzer
  - Svelte for VS Code
  - Tauri
  - Prettier
  - ESLint

### Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/mermaid-gui-v2.git
   cd mermaid-gui-v2
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/baris-sinapli/mermaid-diagram.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Start development server**:
   ```bash
   npm run tauri dev
   ```

## 🛠️ Development Setup

### Project Structure
```
mermaid-gui-v2/
├── src/                    # Frontend (SvelteKit + TypeScript)
│   ├── lib/
│   │   ├── components/     # Reusable UI components
│   │   ├── services/       # Business logic services
│   │   ├── stores/         # State management (Svelte stores)
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Helper utilities
│   └── routes/             # SvelteKit routes
├── src-tauri/              # Backend (Rust + Tauri)
│   ├── src/
│   │   ├── commands/       # Tauri command handlers
│   │   ├── models/         # Data structures
│   │   ├── services/       # Core business logic
│   │   └── utils/          # Utility functions
│   └── Cargo.toml
├── docs/                   # Documentation
├── tests/                  # Test files
└── scripts/                # Build and utility scripts
```

### Environment Setup

1. **Install Tauri CLI**:
   ```bash
   cargo install tauri-cli --version "^2.0.0"
   ```

2. **Install Mermaid CLI** (required for diagram generation):
   ```bash
   npm install -g @mermaid-js/mermaid-cli
   ```

3. **Platform-specific dependencies**:

   **Linux (Ubuntu/Debian)**:
   ```bash
   sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
   ```

   **macOS**:
   ```bash
   xcode-select --install
   ```

   **Windows**:
   - Install [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
   - Install [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (usually pre-installed)

### Development Commands

```bash
# Start development server
npm run tauri dev

# Build for production
npm run tauri build

# Run frontend only (for UI development)
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check

# Testing
npm test                    # Frontend tests
cargo test                  # Backend tests
npm run test:e2e           # End-to-end tests
```

## 🎯 How to Contribute

### Types of Contributions

We welcome various types of contributions:

- 🐛 **Bug fixes** - Help us squash bugs
- ✨ **New features** - Add functionality users want
- 📝 **Documentation** - Improve guides and examples
- 🎨 **UI/UX improvements** - Make the interface better
- ⚡ **Performance optimizations** - Make things faster
- 🌍 **Translations** - Add support for new languages
- 🧪 **Tests** - Improve code coverage
- 🔧 **DevOps** - Improve build processes

### Finding Issues to Work On

1. **Good First Issues**: Look for issues labeled [`good first issue`](https://github.com/baris-sinapli/mermaid-diagram/labels/good%20first%20issue)
2. **Help Wanted**: Check [`help wanted`](https://github.com/baris-sinapli/mermaid-diagram/labels/help%20wanted) label
3. **Bug Reports**: Fix issues labeled [`bug`](https://github.com/baris-sinapli/mermaid-diagram/labels/bug)
4. **Feature Requests**: Implement [`enhancement`](https://github.com/baris-sinapli/mermaid-diagram/labels/enhancement) features

### Before You Start

1. **Check existing issues** to avoid duplicating work
2. **Comment on the issue** to let others know you're working on it
3. **Ask questions** if anything is unclear
4. **Start small** if you're new to the project

## 📏 Coding Standards

### General Guidelines

- **Write clear, readable code** with descriptive variable names
- **Follow existing patterns** in the codebase
- **Add comments** for complex logic
- **Keep functions small** and focused on a single responsibility
- **Use TypeScript** for type safety

### Frontend (Svelte/TypeScript)

```typescript
// ✅ Good: Clear function with proper typing
export async function generateDiagram(
  code: string,
  options: DiagramOptions
): Promise<DiagramResult> {
  if (!code.trim()) {
    throw new Error('Diagram code cannot be empty');
  }
  
  return await tauriService.generate_diagram(code, options);
}

// ❌ Bad: Unclear function without types
export async function gen(c, o) {
  return await service.gen(c, o);
}
```

**Svelte Components**:
- Use `PascalCase` for component names
- Use `camelCase` for props and variables
- Follow the component structure: script, markup, style
- Use proper TypeScript annotations

```svelte
<script lang="ts">
  export let title: string;
  export let onSave: () => void;
  
  let isLoading = false;
  
  async function handleSave() {
    isLoading = true;
    try {
      await onSave();
    } finally {
      isLoading = false;
    }
  }
</script>

<button on:click={handleSave} disabled={isLoading}>
  {isLoading ? 'Saving...' : title}
</button>
```

### Backend (Rust)

```rust
// ✅ Good: Clear function with proper error handling
#[command]
pub async fn generate_diagram(
    code: String,
    options: DiagramOptions,
) -> Result<DiagramResult, String> {
    if code.trim().is_empty() {
        return Err("Diagram code cannot be empty".to_string());
    }
    
    // Implementation here
}

// ❌ Bad: Unclear function without error handling
#[command]
pub async fn gen(c: String, o: DiagramOptions) -> DiagramResult {
    // Implementation without validation
}
```

**Rust Guidelines**:
- Use `snake_case` for functions and variables
- Use `PascalCase` for types and enums
- Handle all `Result` types properly
- Add documentation comments with `///`
- Use `#[derive]` attributes appropriately

### CSS/Styling

- Use **CSS custom properties** for theming
- Follow **BEM naming convention** for classes
- Use **semantic HTML** elements
- Ensure **accessibility** (ARIA labels, keyboard navigation)
- Test in both **light and dark themes**

```css
/* ✅ Good: Semantic CSS with custom properties */
.button {
  background: var(--primary);
  color: var(--primary-foreground);
  border-radius: var(--radius);
  transition: background 0.2s;
}

.button:hover {
  background: var(--primary-hover);
}

.button--secondary {
  background: var(--secondary);
  color: var(--secondary-foreground);
}
```

## 🧪 Testing Guidelines

### Frontend Testing

We use **Vitest** for unit testing and **Playwright** for E2E testing.

```typescript
// Example unit test
import { describe, it, expect } from 'vitest';
import { formatFileSize } from '$lib/utils/formatting';

describe('formatFileSize', () => {
  it('should format bytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1048576)).toBe('1 MB');
  });
});
```

### Backend Testing

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_diagram_generation() {
        let options = DiagramOptions {
            format: DiagramFormat::Png,
            width: Some(800),
            height: Some(600),
            background: "white".to_string(),
            theme: None,
        };
        
        // Test implementation
    }
}
```

### Writing Good Tests

- **Test behavior, not implementation**
- **Use descriptive test names**
- **Keep tests isolated** (no shared state)
- **Test edge cases** and error conditions
- **Mock external dependencies**

### Running Tests

```bash
# Frontend unit tests
npm test

# Frontend E2E tests
npm run test:e2e

# Backend tests
cargo test

# Test coverage
npm run test:coverage
cargo tarpaulin --out html
```

## 🔄 Pull Request Process

### Before Submitting

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** following coding standards

4. **Test your changes**:
   ```bash
   npm run lint
   npm run type-check
   npm test
   cargo test
   npm run tauri build  # Ensure it builds
   ```

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new diagram export format"
   ```

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```bash
feat(editor): add Monaco editor integration
fix(export): resolve PNG export memory leak
docs(readme): update installation instructions
test(service): add unit tests for file service
```

### Pull Request Template

When you create a PR, please include:

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] I have tested the changes manually

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

### Review Process

1. **Automated checks** must pass (CI/CD pipeline)
2. **At least one maintainer review** required
3. **Address feedback** promptly and respectfully
4. **Update documentation** if needed
5. **Squash commits** if requested before merge

## 📝 Issue Guidelines

### Reporting Bugs

Use our [Bug Report Template](https://github.com/baris-sinapli/mermaid-diagram/issues/new?template=bug_report.md):

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. Windows 11, macOS 13, Ubuntu 22.04]
 - App Version: [e.g. 2.0.1]
 - Mermaid CLI Version: [run `mmdc --version`]

**Additional context**
Add any other context about the problem here.
```

### Feature Requests

Use our [Feature Request Template](https://github.com/baris-sinapli/mermaid-diagram/issues/new?template=feature_request.md):

```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

### Issue Labels

We use the following labels to categorize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `documentation` - Improvements or additions to documentation
- `question` - Further information is requested
- `wontfix` - This will not be worked on
- `duplicate` - This issue or pull request already exists

## 🌍 Translation & Localization

### Adding a New Language

1. **Create language files** in `src/lib/locales/[lang].json`
2. **Add language to configuration**
3. **Test RTL support** if applicable
4. **Update documentation**

Example translation file structure:
```json
{
  "common": {
    "save": "Save",
    "open": "Open",
    "cancel": "Cancel"
  },
  "editor": {
    "title": "Mermaid Code",
    "placeholder": "Enter your Mermaid diagram code here..."
  },
  "export": {
    "title": "Export Diagram",
    "formats": {
      "png": "PNG Image",
      "svg": "SVG Vector",
      "pdf": "PDF Document"
    }
  }
}
```

### Translation Guidelines

- **Keep translations concise** but clear
- **Maintain consistency** with existing terminology
- **Consider cultural context** and conventions
- **Test UI layout** with longer/shorter text
- **Use proper character encoding** (UTF-8)

## 🎓 Learning Resources

### Getting Familiar with the Tech Stack

- **Svelte/SvelteKit**: [Official Tutorial](https://svelte.dev/tutorial)
- **TypeScript**: [Handbook](https://www.typescriptlang.org/docs/)
- **Rust**: [The Rust Book](https://doc.rust-lang.org/book/)
- **Tauri**: [Getting Started Guide](https://tauri.app/start/)
- **Mermaid**: [Documentation](https://mermaid.js.org/)

## 📞 Contact

### Maintainers

- **Barış Sinaplı** - [@baris-sinapli](https://github.com/baris-sinapli)

### Support Channels

- **Technical Issues**: [GitHub Issues](https://github.com/baris-sinapli/mermaid-diagram/issues)
- **General Discussion**: [GitHub Discussions](https://github.com/baris-sinapli/mermaid-diagram/discussions)

---

## 🙏 Thank You

Thank you for taking the time to contribute to Mermaid GUI v2.0! Every contribution, no matter how small, makes a difference. Together, we're building a tool that empowers developers worldwide to create better documentation and communicate more effectively.

**Happy coding!** 🚀

---

*This contributing guide is a living document. If you have suggestions for improvements, please submit a pull request or create an issue.*