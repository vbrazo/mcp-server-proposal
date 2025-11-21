# Demo Repositories

This directory contains **intentionally vulnerable** demo repositories designed to showcase the compliance checking capabilities of AI Compliance Copilot.

## ⚠️ WARNING

These repositories contain **intentional security vulnerabilities and compliance issues** with **FAKE SECRETS** for demonstration purposes only. They should **NEVER** be used in production.

**All secrets in these demos are fake and non-functional:**
- API keys use test/fake prefixes
- AWS credentials are from AWS documentation examples
- Private keys are generated fake keys
- Database passwords are placeholder values

## Demo Repositories

### 1. vulnerable-ecommerce
An e-commerce application with multiple security and compliance issues:
- Hardcoded API keys
- SQL injection vulnerabilities
- Weak password hashing (MD5)
- Outdated dependencies with known CVEs
- Missing license headers

### 2. corporate-backend
A corporate API backend with license and code quality issues:
- Committed AWS credentials
- GPL license violations
- Missing security headers
- Code quality problems (long functions, high complexity)

### 3. crypto-wallet
A cryptocurrency wallet with cryptography and security flaws:
- Weak cryptographic algorithms (DES)
- Hardcoded private keys
- Dangerous eval() usage
- Insufficient input validation
- Vulnerable dependencies

## Usage

Each demo repository can be:
1. Cloned to your GitHub account
2. Used to test the Compliance Copilot GitHub App
3. Modified to create test PRs with compliance issues

## Testing with Compliance Copilot

1. Fork one of the demo repositories to your GitHub account
2. Install the Compliance Copilot GitHub App on that repository
3. Create a pull request with changes
4. Watch as the bot automatically detects and reports issues

## Example Compliance Issues

Each repository demonstrates all four compliance categories:

- **Security**: Hardcoded secrets, vulnerabilities, dangerous functions
- **License**: GPL violations, missing headers, incompatible licenses
- **Quality**: Code complexity, code smells, best practice violations
- **Custom**: Company-specific rules and patterns

## Contributing

If you'd like to add more examples of compliance issues, please submit a PR!

