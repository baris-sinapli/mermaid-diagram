# Security Policy

## Our Commitment to Security

Mermaid GUI v2.0 takes security seriously. We believe that responsible disclosure of security vulnerabilities helps us ensure the safety and privacy of our users.

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | ✅ Full support     |
| 1.x.x   | ❌ End of life      |

## Security Features

### Privacy-First Design
- **No Network Requests**: Application operates 100% offline
- **Local Data Only**: All files remain on your computer
- **No Telemetry**: We don't collect any usage data
- **Open Source**: Full transparency of code

### Application Security
- **Tauri Security Model**: Sandboxed execution environment
- **Memory Safety**: Rust backend prevents memory vulnerabilities
- **File System Isolation**: Limited access to user-selected files only
- **No Code Execution**: Safe diagram processing only

## Reporting a Vulnerability

If you discover a security vulnerability, please follow these steps:

### 1. **DO NOT** open a public issue

Security vulnerabilities should not be disclosed publicly until they have been addressed.

### 2. Send a detailed report to our security team

**Email**: [baris.sinapli@outlook.com](mailto:baris.sinapli@outlook.com)

**Subject**: `[SECURITY] Vulnerability Report - Mermaid GUI v2.0`

### 3. Include the following information

- **Description**: Clear description of the vulnerability
- **Impact**: Potential impact and attack scenarios
- **Reproduction**: Steps to reproduce the issue
- **Environment**: Operating system, application version
- **Proof of Concept**: Code, screenshots, or logs (if applicable)
- **Suggested Fix**: If you have ideas for remediation

### Example Security Report

```
Subject: [SECURITY] Vulnerability Report - Mermaid GUI v2.0

Description:
[Detailed description of the vulnerability]

Impact:
[What could an attacker achieve with this vulnerability?]

Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Environment:
- OS: [Windows 11 / macOS 13 / Ubuntu 22.04]
- App Version: [2.0.1]
- Rust Version: [1.75.0]

Proof of Concept:
[Code snippets, screenshots, or logs]

Suggested Fix:
[Your recommendations for fixing the issue]
```

## Response Timeline

We are committed to responding to security reports in a timely manner:

- **Initial Response**: Within 24 hours
- **Triage and Assessment**: Within 72 hours
- **Fix Development**: 1-2 weeks for critical issues
- **Release and Disclosure**: Coordinated disclosure after fix

## Severity Classification

We classify security issues using the following criteria:

### 🔴 Critical
- Remote code execution
- Privilege escalation
- Data exfiltration

### 🟠 High
- Local code execution
- Sensitive data exposure
- Authentication bypass

### 🟡 Medium
- Denial of service
- Information disclosure
- Input validation issues

### 🟢 Low
- Security misconfigurations
- Non-exploitable issues
- Theoretical vulnerabilities

## Bounty Program

While we don't currently offer a formal bug bounty program, we deeply appreciate security researchers who help us improve our application. Contributors who report valid security issues will be:

- **Acknowledged** in our security advisories
- **Listed** in our CONTRIBUTORS.md file
- **Invited** to test fixes before public release
- **Considered** for maintainer roles in the project

## Security Best Practices for Users

### For End Users

1. **Download from Official Sources**
   - Only download from our GitHub releases
   - Verify checksums if provided
   - Avoid third-party installers

2. **Keep Updated**
   - Enable automatic updates when available
   - Monitor our releases for security patches
   - Subscribe to security advisories

3. **Safe Usage**
   - Don't process untrusted Mermaid files
   - Be cautious with files from unknown sources
   - Use antivirus software

### For Developers

1. **Development Environment**
   - Use latest stable Rust version
   - Keep dependencies updated
   - Use `cargo audit` to check for known vulnerabilities

2. **Code Security**
   - Follow secure coding practices
   - Validate all inputs
   - Use safe Rust patterns
   - Avoid `unsafe` blocks unless necessary

3. **Build Security**
   - Use official build toolchains
   - Verify dependency integrity
   - Sign releases when possible

## Known Security Considerations

### File System Access
- Application requires file system access for Mermaid files
- Access is limited to user-selected files only
- No automatic scanning or indexing of file system

### External Dependencies
- **mmdc (Mermaid CLI)**: Required for diagram generation
- **Node.js**: Required for mmdc functionality
- Regular dependency audits performed

### Platform Security
- **Windows**: Requires WebView2 runtime
- **macOS**: Follows Apple security guidelines
- **Linux**: Uses system WebKit libraries

## Incident Response

In the event of a security incident:

1. **Immediate Response**
   - Assess the scope and impact
   - Implement temporary mitigations
   - Notify affected users if necessary

2. **Investigation**
   - Determine root cause
   - Identify affected versions
   - Develop comprehensive fix

3. **Resolution**
   - Release security update
   - Publish security advisory
   - Update documentation

4. **Post-Incident**
   - Conduct lessons learned review
   - Update security practices
   - Improve prevention measures

## Security Advisory Format

When we release security advisories, they will include:

- **CVE ID** (if applicable)
- **Affected Versions**
- **Severity Rating**
- **Description**
- **Impact**
- **Mitigation Steps**
- **Fixed Versions**
- **Credits**

## Legal

We are committed to working with security researchers under the principle of responsible disclosure. We will not pursue legal action against researchers who:

- Make a good-faith effort to avoid harm to users and the project
- Report vulnerabilities through the proper channels
- Allow reasonable time for fixes before public disclosure
- Do not violate laws or regulations

## Updates to This Policy

This security policy may be updated periodically. Significant changes will be announced through:

- GitHub releases
- Project README
- Security advisories
