# 🤝 Contributing to Mermaid GUI v2.0

<div align="center">

[![Contributors](https://img.shields.io/github/contributors/baris-sinapli/mermaid-diagram?style=for-the-badge)](CONTRIBUTORS.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](https://github.com/baris-sinapli/mermaid-diagram/pulls)
[![Good First Issues](https://img.shields.io/github/issues/baris-sinapli/mermaid-diagram/good%20first%20issue?style=for-the-badge&color=7057ff)](https://github.com/baris-sinapli/mermaid-diagram/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)

**Welcome! Thank you for considering contributing to Mermaid GUI v2.0! 🎉**

</div>

---

## 🌟 Quick Start

1. **⭐ Star the repository** (it means a lot!)
2. **🍴 Fork the project**
3. **📖 Read this guide**
4. **🚀 Start contributing!**

---

## 📋 Table of Contents

- [🚀 Getting Started](#-getting-started)
- [🔧 Development Setup](#-development-setup)
- [🎯 Types of Contributions](#-types-of-contributions)
- [📝 Contribution Process](#-contribution-process)
- [🧪 Testing Guidelines](#-testing-guidelines)
- [📖 Documentation](#-documentation)
- [🐛 Bug Reports](#-bug-reports)
- [✨ Feature Requests](#-feature-requests)
- [💅 Code Style](#-code-style)
- [🏷️ Commit Convention](#️-commit-convention)
- [🔍 Code Review](#-code-review)
- [🙏 Recognition](#-recognition)

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed
- **Rust** 1.75+ with `cargo` 
- **Git** for version control
- **mmdc** (Mermaid CLI) installed globally: `npm install -g @mermaid-js/mermaid-cli`

### System Requirements

| OS | Requirements |
|---|---|
| **Linux** | `pkg-config`, `libwebkit2gtk-4.1-dev`, `build-essential`, `curl`, `wget`, `libssl-dev`, `libgtk-3-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev` |
| **macOS** | Xcode Command Line Tools |
| **Windows** | Microsoft C++ Build Tools, WebView2 |

---

## 🔧 Development Setup

### 1. Fork & Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/mermaid-diagram.git
cd mermaid-diagram
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Rust dependencies (handled by Cargo)
cd src-tauri
cargo build
cd ..
```

### 3. Start Development

```bash
# Start development server (hot reload enabled)
npm run tauri dev

# Alternative: separate frontend and backend
npm run dev        # Frontend only
cargo tauri dev    # Full stack
```

### 4. Verify Setup

- ✅ Application opens without errors
- ✅ Mermaid diagrams can be created and exported  
- ✅ File operations (New, Open, Save) work
- ✅ mmdc status shows "available" in the status bar

---

## 🎯 Types of Contributions

We welcome various types of contributions:

### 🐛 Bug Fixes
- Fix existing issues
- Improve error handling
- Cross-platform compatibility

### ✨ New Features  
- Template system enhancements
- Export format improvements
- UI/UX improvements
- Performance optimizations

### 📖 Documentation
- README improvements
- Code comments
- User guides
- API documentation

### 🧪 Testing
- Unit tests
- Integration tests
- End-to-end tests
- Performance tests

### 🎨 Design & UX
- UI improvements
- Accessibility enhancements
- Theme improvements
- Icon design

### 🔧 DevOps & Tools
- CI/CD improvements
- Build optimizations
- Development tools
- Automation scripts

---

## 📝 Contribution Process

### 1. Find an Issue or Create One

- Browse [Good First Issues](https://github.com/baris-sinapli/mermaid-diagram/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
- Check [Help Wanted](https://github.com/baris-sinapli/mermaid-diagram/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)
- Or create a new issue to discuss your idea

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number-description
```

### 3. Make Your Changes

- Write clean, well-documented code
- Follow our [code style guidelines](#-code-style)
- Add tests for new functionality
- Update documentation as needed

### 4. Test Your Changes

```bash
# Run tests
npm run test
cargo test

# Test the application
npm run tauri dev

# Build for production
npm run tauri build
```

### 5. Commit Your Changes

Follow our [commit convention](#️-commit-convention):

```bash
git add .
git commit -m "feat: add batch processing for multiple diagrams

- Implement parallel processing for .mmd files
- Add progress indicator with cancellation support
- Update UI with batch processing controls

Closes #42"
```

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear description of changes
- Link to related issues
- Screenshots (for UI changes)
- Testing instructions

---

## 🧪 Testing Guidelines

### Frontend Testing (Svelte)

```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Backend Testing (Rust)

```bash
# Run all tests
cargo test

# Run specific test
cargo test test_name

# Run with output
cargo test -- --nocapture
```

### Manual Testing Checklist

Before submitting, verify:

- [ ] ✅ Application starts without errors
- [ ] ✅ All existing features still work
- [ ] ✅ New features work as expected
- [ ] ✅ Cross-platform compatibility (if applicable)
- [ ] ✅ No console errors or warnings
- [ ] ✅ Performance hasn't degraded

---

## 📖 Documentation

### Code Documentation

- **Rust**: Use `///` for public APIs, `//` for internal comments
- **TypeScript/Svelte**: Use JSDoc comments for functions and components
- **README**: Keep updated with new features

### Documentation Updates

When adding features, update:
- README.md
- User documentation
- API documentation  
- Code comments
- CHANGELOG.md

---

## 🐛 Bug Reports

### Before Reporting

- Check if the issue already exists
- Try reproducing on different platforms
- Gather system information

### Bug Report Template

```markdown
**Describe the Bug**
A clear description of what the bug is.

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. Windows 11, macOS 13, Ubuntu 22.04]
- App Version: [e.g. v2.0.1]
- Node.js Version: [e.g. 18.17.0]
- Rust Version: [e.g. 1.75.0]

**Additional Context**
Any other context about the problem.
```

---

## ✨ Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Any other context, mockups, or screenshots.

**Implementation Ideas**
If you have technical ideas about implementation.
```

---

## 💅 Code Style

### Rust (Backend)

```rust
// Use rustfmt for formatting
cargo fmt

// Use clippy for linting
cargo clippy

// Follow these conventions:
// - Use snake_case for functions and variables
// - Use PascalCase for types and structs
// - Add comprehensive error handling
// - Document public APIs

/// Generates a Mermaid diagram from code
/// 
/// # Arguments
/// * `code` - The Mermaid syntax code
/// * `options` - Diagram generation options
/// 
/// # Returns
/// * `Result<DiagramResult, String>` - Success with result or error message
pub fn generate_diagram(code: &str, options: &DiagramOptions) -> Result<DiagramResult, String> {
    // Implementation
}
```

### TypeScript/Svelte (Frontend)

```typescript
// Use Prettier for formatting
npm run format

// Use ESLint for linting  
npm run lint

// Follow these conventions:
// - Use camelCase for variables and functions
// - Use PascalCase for components and classes
// - Add TypeScript types for everything
// - Use meaningful variable names

/**
 * Handles file save operation
 * @param filePath - Path where to save the file
 * @param content - File content to save
 * @returns Promise resolving to save result
 */
export async function saveFile(filePath: string, content: string): Promise<SaveResult> {
  // Implementation
}
```

### Configuration Files

- **Prettier**: `.prettierrc`
- **ESLint**: `.eslintrc.json`
- **Rustfmt**: `rustfmt.toml`

---

## 🏷️ Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples
```bash
feat: add dark theme support

feat(ui): implement split-panel layout with resizable divider

fix: resolve file path issues on Windows

docs: update installation instructions for Linux

test: add unit tests for diagram generation

chore: update dependencies to latest versions
```

---

## 🔍 Code Review

### For Contributors

- Keep PRs focused and small
- Write clear commit messages
- Add tests for new features
- Update documentation
- Respond to feedback promptly

### Review Process

1. **Automated Checks**: CI must pass
2. **Code Review**: Maintainer review
3. **Testing**: Manual testing if needed
4. **Approval**: At least one approval required
5. **Merge**: Squash or merge commit

### Review Criteria

- ✅ Code quality and style
- ✅ Test coverage
- ✅ Documentation updates
- ✅ Breaking changes noted
- ✅ Performance impact
- ✅ Security considerations

---

## 🙏 Recognition

### Contributors

All contributors are recognized in:
- [CONTRIBUTORS.md](CONTRIBUTORS.md)
- Release notes
- README.md
- Social media shout-outs

### Maintainer Recognition

Outstanding contributors may be invited to become maintainers with:
- Commit access
- Review privileges
- Decision-making input
- Mentoring opportunities

---

## 📞 Getting Help

### Communication Channels

- **Issues**: For bugs and feature requests
- **Discussions**: For questions and ideas

### Response Times

- **Issues**: 24-48 hours
- **PRs**: 48-72 hours  
- **Discussions**: 1-3 days

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project (GPL-3.0).

---

## 🎯 Current Priorities

Looking for ways to contribute? These areas need attention:

### High Priority
- [ ] 🐛 Cross-platform file dialog improvements
- [ ] ⚡ Performance optimization for large diagrams
- [ ] 🎨 Dark theme refinements
- [ ] 📱 Mobile responsiveness

### Medium Priority  
- [ ] 🧪 Test suite expansion
- [ ] 📖 User documentation improvements
- [ ] 🔄 Auto-update mechanism
- [ ] 🌍 Internationalization support

### Low Priority
- [ ] 🎭 More themes
- [ ] 📊 Analytics and metrics
- [ ] 🔌 Plugin system
- [ ] ☁️ Cloud sync features

---

<div align="center">

## 🌟 Thank You!

**Your contributions make this project better for everyone!**

[![Contributors](https://contrib.rocks/image?repo=baris-sinapli/mermaid-diagram)](CONTRIBUTORS.md)

**[⭐ Star the Repository](https://github.com/baris-sinapli/mermaid-diagram) • [🍴 Fork the Project](https://github.com/baris-sinapli/mermaid-diagram/fork) • [📢 Share with Friends](https://twitter.com/intent/tweet?text=Check%20out%20Mermaid%20GUI%20v2.0%20-%20an%20awesome%20offline-first%20diagram%20tool!&url=https://github.com/baris-sinapli/mermaid-diagram)**

---

<sub>Made with ❤️ by [baris-sinapli](https://github.com/baris-sinapli) and the [open source community](CONTRIBUTORS.md)</sub>

</div>