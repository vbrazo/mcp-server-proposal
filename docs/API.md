# API Reference

Base URL: `https://api.compliance-copilot.com` (or `http://localhost:3001` for local development)

## Authentication

Most API endpoints are public for dashboard access. GitHub webhook endpoints require valid webhook signatures.

## Endpoints

### Health Check

Check API health status.

```http
GET /health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "healthy",
    "e2b": "configured",
    "groq": "configured"
  }
}
```

---

### Get Recent Analyses

Retrieve recent PR analyses.

```http
GET /api/analyses?limit=50&repo=owner/repo
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | No | Number of results (default: 50, max: 100) |
| `repo` | string | No | Filter by repository (format: `owner/repo`) |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "prNumber": 42,
      "repoFullName": "owner/repo",
      "status": "completed",
      "findings": [...],
      "analyzedAt": "2024-01-01T12:00:00.000Z",
      "duration": 15234,
      "stats": {
        "totalFiles": 5,
        "totalFindings": 12,
        "critical": 2,
        "high": 4,
        "medium": 3,
        "low": 2,
        "info": 1
      }
    }
  ],
  "count": 1
}
```

**cURL Example:**

```bash
curl https://api.compliance-copilot.com/api/analyses?limit=10
```

---

### Get Analysis by ID

Retrieve detailed analysis including all findings.

```http
GET /api/analyses/:id
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Analysis ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "prNumber": 42,
    "repoFullName": "owner/repo",
    "status": "completed",
    "findings": [
      {
        "id": "finding-1",
        "type": "security",
        "severity": "critical",
        "message": "Hardcoded API key detected",
        "file": "config.js",
        "line": 10,
        "column": 15,
        "code": "const apiKey = 'sk_live_1234...';",
        "fixSuggestion": "Move API key to environment variables",
        "ruleId": "secret-api-key",
        "ruleName": "Hardcoded API Key"
      }
    ],
    "analyzedAt": "2024-01-01T12:00:00.000Z",
    "duration": 15234,
    "stats": {
      "totalFiles": 5,
      "totalFindings": 12,
      "critical": 2,
      "high": 4,
      "medium": 3,
      "low": 2,
      "info": 1
    }
  }
}
```

**cURL Example:**

```bash
curl https://api.compliance-copilot.com/api/analyses/550e8400-e29b-41d4-a716-446655440000
```

---

### Get Statistics

Retrieve overall compliance statistics.

```http
GET /api/stats
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalAnalyses": 1234,
    "totalFindings": 5678,
    "criticalIssues": 89,
    "highIssues": 234,
    "mediumIssues": 567,
    "lowIssues": 890,
    "infoIssues": 123,
    "avgDuration": 18456.78
  }
}
```

**cURL Example:**

```bash
curl https://api.compliance-copilot.com/api/stats
```

---

### Add/Update Custom Rule

Configure custom compliance rule.

```http
POST /api/config/rules
Content-Type: application/json
```

**Request Body:**

```json
{
  "id": "custom-rule-1",
  "name": "Internal API Usage",
  "description": "Must use internal APIs only",
  "enabled": true,
  "type": "regex",
  "pattern": "https://external-api\\.com",
  "severity": "high",
  "category": "custom",
  "fixTemplate": "Replace with https://internal-api.company.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Rule saved successfully",
  "data": {
    "id": "custom-rule-1",
    ...
  }
}
```

**cURL Example:**

```bash
curl -X POST https://api.compliance-copilot.com/api/config/rules \
  -H "Content-Type: application/json" \
  -d '{
    "id": "custom-rule-1",
    "name": "Internal API Usage",
    "type": "regex",
    "pattern": "external-api",
    "severity": "high",
    "category": "custom"
  }'
```

---

### Trigger Manual Scan

Manually trigger PR analysis.

```http
POST /api/trigger-scan
Content-Type: application/json
```

**Request Body:**

```json
{
  "owner": "username",
  "repo": "repository",
  "prNumber": 42
}
```

**Response:**

```json
{
  "success": true,
  "message": "Scan triggered successfully",
  "data": {
    "owner": "username",
    "repo": "repository",
    "prNumber": 42,
    "status": "queued"
  }
}
```

**cURL Example:**

```bash
curl -X POST https://api.compliance-copilot.com/api/trigger-scan \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "username",
    "repo": "repository",
    "prNumber": 42
  }'
```

---

## Webhooks

### GitHub Webhook

Receive GitHub events for PR analysis.

```http
POST /api/webhook
Content-Type: application/json
X-Hub-Signature-256: sha256=...
X-GitHub-Event: pull_request
```

**Events Supported:**

- `pull_request` (opened, synchronize, reopened)
- `issue_comment` (created on PRs)

**Webhook Signature:**

All webhooks must be signed with HMAC SHA-256:

```typescript
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');

const expectedSignature = `sha256=${signature}`;
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid webhook signature |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/api/*` | 10 requests/second |
| `/api/webhook` | 30 requests/minute |
| `/api/trigger-scan` | 5 requests/minute |

Rate limit headers:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1640995200
```

---

## Data Types

### ComplianceFinding

```typescript
interface ComplianceFinding {
  id: string;
  type: 'security' | 'license' | 'quality' | 'custom';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  message: string;
  file: string;
  line?: number;
  column?: number;
  code?: string;
  fixSuggestion?: string;
  ruleId: string;
  ruleName: string;
}
```

### AnalysisResult

```typescript
interface AnalysisResult {
  id: string;
  prNumber: number;
  repoFullName: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  findings: ComplianceFinding[];
  analyzedAt: Date;
  duration: number;
  stats: {
    totalFiles: number;
    totalFindings: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
}
```

### CustomRule

```typescript
interface CustomRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: 'regex' | 'dependency' | 'license';
  pattern?: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'security' | 'license' | 'quality' | 'custom';
  fixTemplate?: string;
}
```

---

## OpenAPI Specification

Download complete OpenAPI 3.0 specification:

```bash
curl https://api.compliance-copilot.com/openapi.json
```

---

## SDKs & Client Libraries

### JavaScript/TypeScript

```typescript
import { ComplianceCopilotClient } from '@compliance-copilot/sdk';

const client = new ComplianceCopilotClient({
  apiUrl: 'https://api.compliance-copilot.com',
});

// Get analyses
const analyses = await client.getAnalyses({ limit: 10 });

// Trigger scan
await client.triggerScan({
  owner: 'username',
  repo: 'repository',
  prNumber: 42,
});
```

### Python

```python
from compliance_copilot import Client

client = Client(api_url='https://api.compliance-copilot.com')

# Get analyses
analyses = client.get_analyses(limit=10)

# Trigger scan
client.trigger_scan(owner='username', repo='repository', pr_number=42)
```

---

**Last updated:** 2024-01-01

