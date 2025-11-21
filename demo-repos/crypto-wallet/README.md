# Crypto Wallet Demo

⚠️ **CRITICAL WARNING**: This repository contains **intentional cryptographic vulnerabilities** for demonstration purposes only. **NEVER** use in production or with real cryptocurrency!

## Intentional Vulnerabilities

This demo crypto wallet contains the following intentional security issues:

### Security Issues
1. **Weak Cryptography (DES)** in `src/crypto.js`
   - Severity: Critical
   - Type: Using outdated DES encryption

2. **Hardcoded Private Key** in `src/keys.js`
   - Severity: Critical
   - Type: Private key in source code

3. **Dangerous eval() Usage** in `src/wallet.js`
   - Severity: High
   - Type: Arbitrary code execution risk

4. **No Input Validation** in `src/validation.js`
   - Severity: High
   - Type: Missing input sanitization

### Dependency Issues
5. **Vulnerable crypto-js Version** in `package.json`
   - Severity: High
   - Known vulnerability in crypto-js 3.1.2

## Expected Findings

When analyzed by Compliance Copilot:
- 2 Critical: Weak crypto + hardcoded private key
- 3 High: eval() + no validation + vulnerable dependency

Total: ~5 critical security findings

