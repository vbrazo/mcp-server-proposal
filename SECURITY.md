# Security Policy

## Demo Repository Disclaimer

⚠️ **IMPORTANT**: This repository contains **intentionally vulnerable code** for demonstration purposes only.

### Intentional Vulnerabilities

The following directories contain **fake secrets and vulnerabilities** designed to showcase compliance detection:

- `demo-repos/vulnerable-ecommerce/` - Contains fake API keys and SQL injection examples
- `demo-repos/corporate-backend/` - Contains fake AWS credentials and license violations  
- `demo-repos/crypto-wallet/` - Contains fake private keys and weak cryptography
- `backend/tests/` - Contains fake secrets for testing the rules engine

### Fake Secrets Used

All secrets in this repository are **fake and non-functional**:

- Stripe API keys: `sk_test_fake...` (test mode, non-functional)
- AWS credentials: Example/fake credentials from AWS documentation
- Private keys: Generated fake keys, not real cryptographic material
- Database passwords: Placeholder values for demo purposes

### Real Security

For the actual application:
- All real secrets are stored in environment variables
- Production deployment uses proper secret management
- GitHub App private keys are properly secured
- Database credentials use secure generation

## Reporting Security Issues

If you find **actual** security vulnerabilities in the compliance detection logic or deployment configuration, please report them via:

- Email: security@compliance-copilot.com
- GitHub Security Advisory (private disclosure)

**Do NOT** report the intentional demo vulnerabilities - they are there on purpose!

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x.x   | ✅ Yes    |
| < 1.0   | ❌ No     |

## Security Features

This project implements:

- ✅ Webhook signature verification (HMAC SHA-256)
- ✅ Rate limiting on all endpoints
- ✅ Input validation and sanitization
- ✅ Secure headers (helmet.js)
- ✅ SQL injection prevention (parameterized queries)
- ✅ Secrets detection and prevention
- ✅ Dependency vulnerability scanning
- ✅ Container security (non-root user)
- ✅ HTTPS enforcement in production
