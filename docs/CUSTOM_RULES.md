# Custom Rules Guide

This guide explains how to create and configure custom compliance rules for your organization.

## Rule Types

### 1. Regex Pattern Rules

Match code patterns using regular expressions.

```json
{
  "id": "custom-api-endpoint",
  "name": "Internal API Endpoint",
  "description": "Must use internal API endpoints",
  "enabled": true,
  "type": "regex",
  "pattern": "https://api\\.external\\.com",
  "severity": "high",
  "category": "custom",
  "fixTemplate": "Replace with https://api.internal.company.com"
}
```

### 2. Dependency Rules

Check for banned or vulnerable dependencies.

```json
{
  "id": "banned-library",
  "name": "Banned Library",
  "description": "library-xyz is not allowed",
  "enabled": true,
  "type": "dependency",
  "pattern": "library-xyz",
  "severity": "critical",
  "category": "security",
  "fixTemplate": "Use approved-library instead"
}
```

### 3. License Rules

Enforce license compliance.

```json
{
  "id": "gpl-check",
  "name": "GPL License Check",
  "description": "GPL libraries not allowed in proprietary code",
  "enabled": true,
  "type": "license",
  "pattern": "gpl|gnu general public",
  "severity": "high",
  "category": "license",
  "fixTemplate": "Replace with MIT or Apache licensed alternative"
}
```

## Rule Configuration

### via API

```bash
curl -X POST https://api.compliance-copilot.com/api/config/rules \
  -H "Content-Type: application/json" \
  -d @rule.json
```

### via Dashboard

1. Navigate to Dashboard → Configuration
2. Click "Add Custom Rule"
3. Fill in rule details
4. Click "Save"

## Example Rules

### Detect Hardcoded Credentials

```json
{
  "id": "custom-credentials",
  "name": "Hardcoded Credentials",
  "description": "Credentials must be in environment variables",
  "enabled": true,
  "type": "regex",
  "pattern": "(username|password)\\s*=\\s*[\"'][^$][^\"']+[\"']",
  "severity": "critical",
  "category": "security",
  "fixTemplate": "Use environment variables: process.env.USERNAME"
}
```

### Enforce TODO Format

```json
{
  "id": "todo-format",
  "name": "TODO Format",
  "description": "TODOs must include ticket number",
  "enabled": true,
  "type": "regex",
  "pattern": "TODO(?!.*JIRA-\\d+)",
  "severity": "low",
  "category": "quality",
  "fixTemplate": "Format: // TODO (JIRA-123): Description"
}
```

### Banned Function

```json
{
  "id": "banned-function",
  "name": "Banned setTimeout",
  "description": "Use our wrapper instead",
  "enabled": true,
  "type": "regex",
  "pattern": "setTimeout\\(",
  "severity": "medium",
  "category": "custom",
  "fixTemplate": "Use utils.delay() instead"
}
```

## Regex Tips

### Common Patterns

**API Keys:**
```regex
(api[_-]?key|apikey)\s*[=:]\s*["']([A-Za-z0-9_\-]{20,})["']
```

**AWS Keys:**
```regex
AKIA[0-9A-Z]{16}
```

**Email Addresses:**
```regex
[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}
```

**IPv4 Addresses:**
```regex
\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b
```

**URLs:**
```regex
https?://[^\s]+
```

### Testing Regex

Test your patterns at [regex101.com](https://regex101.com)

## Best Practices

1. **Start specific, then generalize** - Test on real code first
2. **Avoid false positives** - Use negative lookaheads
3. **Include context** - Match surrounding code
4. **Provide good messages** - Explain why and how to fix
5. **Set appropriate severity** - Critical for security, low for style

## Severity Levels

| Level | When to Use | Example |
|-------|-------------|---------|
| critical | Security vulnerabilities, exposed secrets | Hardcoded API keys |
| high | Major issues requiring immediate attention | SQL injection, GPL violations |
| medium | Important but not urgent | Code complexity, missing tests |
| low | Minor issues, style violations | Missing documentation, TODO comments |
| info | Informational only | Code statistics, suggestions |

## Categories

| Category | Description | Examples |
|----------|-------------|----------|
| security | Security vulnerabilities | Secrets, injection, weak crypto |
| license | License compliance | GPL violations, missing headers |
| quality | Code quality | Complexity, smells, best practices |
| custom | Organization-specific | Internal APIs, coding standards |

## Advanced Examples

### Multi-line Pattern

```json
{
  "id": "unsafe-html",
  "name": "Unsafe HTML Insertion",
  "description": "Use safe HTML methods",
  "enabled": true,
  "type": "regex",
  "pattern": "innerHTML\\s*=\\s*[^;]+\\+",
  "severity": "high",
  "category": "security",
  "fixTemplate": "Use textContent or DOMPurify.sanitize()"
}
```

### Context-Aware Pattern

```json
{
  "id": "missing-error-handling",
  "name": "Missing Error Handling",
  "description": "Async functions must have try-catch",
  "enabled": true,
  "type": "regex",
  "pattern": "async\\s+function[^{]*{(?!.*try).*await",
  "severity": "medium",
  "category": "quality",
  "fixTemplate": "Wrap await calls in try-catch"
}
```

## Disabling Rules

### Per PR

Comment on PR:
```
@compliance-bot ignore custom-api-endpoint
```

### Globally

Set `enabled: false` in rule configuration

### Per File

Add comment at top of file:
```javascript
// compliance-copilot-disable custom-api-endpoint
```

## Rule Priority

Rules are executed in this order:

1. Built-in security rules
2. Built-in license rules
3. Custom security rules
4. Custom license rules
5. Built-in quality rules
6. Custom quality rules
7. Custom rules (other categories)

## Testing Custom Rules

Use the demo repositories to test rules:

```bash
# Clone demo repo
git clone https://github.com/yourusername/vulnerable-ecommerce

# Add your custom rule
curl -X POST http://localhost:3001/api/config/rules -d @rule.json

# Create a PR with test code
# Bot will analyze with your custom rule
```

## Troubleshooting

**Rule not triggering:**
- Check regex syntax
- Verify pattern matches exact code
- Ensure rule is enabled
- Check file type is supported

**Too many false positives:**
- Add negative lookaheads
- Make pattern more specific
- Adjust severity level
- Use context matching

**Pattern too slow:**
- Avoid catastrophic backtracking
- Simplify complex patterns
- Test with regex profiler
- Consider splitting into multiple rules

---

**Last updated:** 2024-01-01

