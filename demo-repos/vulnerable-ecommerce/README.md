# Vulnerable E-Commerce Demo

⚠️ **WARNING**: This repository contains **intentional security vulnerabilities** for demonstration purposes only. DO NOT use in production!

## Intentional Vulnerabilities

This demo application contains the following intentional compliance issues:

### Security Issues
1. **Hardcoded Stripe API Key** in `src/config.js` (fake key for demo)
   - Severity: Critical
   - Type: Hardcoded secret

2. **SQL Injection Vulnerability** in `src/db.js`
   - Severity: Critical
   - Type: SQL injection via string concatenation

3. **Weak Password Hashing** in `src/auth.js`
   - Severity: High
   - Type: Using MD5 instead of bcrypt

### Dependency Issues
4. **Vulnerable Express Version** in `package.json`
   - Severity: High
   - CVE: CVE-2014-6393

### License Issues
5. **Missing LICENSE File**
   - Severity: Low
   - Type: No license specified

6. **Missing License Headers** in source files
   - Severity: Low
   - Type: Copyright/license headers missing

## Testing

Create a PR with changes to any of these files to see Compliance Copilot in action!

## Expected Findings

When analyzed by Compliance Copilot, this repository should detect:
- 1 Critical: Hardcoded API key
- 1 Critical: SQL injection
- 2 High: Weak crypto + vulnerable dependency
- 2 Low: Missing license information

Total: ~6 compliance findings

