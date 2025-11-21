# Corporate Backend Demo

⚠️ **WARNING**: This repository contains **intentional compliance violations** for demonstration purposes only. DO NOT use in production!

## Intentional Issues

### Security Issues
1. **Committed .env file** with AWS credentials
   - Severity: Critical
   - Type: Hardcoded secrets

2. **Missing Security Headers** in `src/api.js`
   - Severity: High
   - Type: No helmet or security middleware

### License Issues
3. **GPL License Violation** in `package.json`
   - Severity: High
   - Type: Using GPL library in proprietary code (license-violation.js)

### Code Quality Issues
4. **Very Long Function** in `src/utils.js`
   - Severity: Medium
   - Type: 200+ line function with high complexity

5. **Missing License Headers** in source files
   - Severity: Low
   - Type: No copyright/license headers

## Expected Findings

When analyzed by Compliance Copilot:
- 1 Critical: Committed AWS credentials
- 2 High: Missing security headers + GPL violation
- 1 Medium: Code quality issue
- Multiple Low: Missing headers

Total: ~7+ compliance findings

