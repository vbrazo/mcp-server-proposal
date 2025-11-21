# Architecture Guide

## System Overview

AI Compliance Copilot is built as a microservices architecture with the following key components:

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   GitHub    │────────>│   Backend    │────────>│   E2B       │
│     App     │ webhook │   API        │  spawn  │  Sandbox    │
└─────────────┘         └──────────────┘         └─────────────┘
                               │                         │
                               │                         │
                               ▼                         ▼
                        ┌──────────────┐         ┌─────────────┐
                        │   Groq AI    │         │ MCP Servers │
                        │   Analysis   │         │   (GitHub)  │
                        └──────────────┘         └─────────────┘
                               │
                               │
                               ▼
                        ┌──────────────┐
                        │  Dashboard   │
                        │  (Next.js)   │
                        └──────────────┘
```

## Core Technologies

### Backend
- **Node.js + TypeScript**: Type-safe runtime
- **Express**: RESTful API framework
- **PostgreSQL**: Primary database for analysis results
- **Redis**: Caching and queue management
- **BullMQ**: Job queue for async PR analysis

### AI & Analysis
- **E2B Code Interpreter**: Sandboxed code execution
- **Groq SDK**: Fast AI inference (llama-3.1-70b-versatile)
- **MCP (Model Context Protocol)**: Tool integrations

### Frontend
- **Next.js 14**: React framework with App Router
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Component library
- **Recharts**: Data visualization

## Analysis Pipeline

### Stage 1: Webhook Reception

```typescript
// GitHub App receives webhook
POST /api/webhook
{
  "action": "opened",
  "pull_request": { ... },
  "repository": { ... }
}
```

**Flow:**
1. Verify webhook signature (HMAC SHA-256)
2. Parse event type (pull_request, issue_comment)
3. Extract PR context (files, author, branch)
4. Queue analysis job

### Stage 2: Rules Engine (Fast)

```typescript
// Regex-based pattern matching
class RulesEngine {
  analyzeFiles(files: ChangedFile[]): ComplianceFinding[]
}
```

**Checks:**
- Hardcoded secrets (API keys, passwords)
- SQL injection patterns
- Dangerous functions (eval, exec)
- Weak cryptography (MD5, SHA1, DES)
- License headers
- Code quality patterns

**Performance:**
- ~10ms per file
- Runs synchronously
- No external API calls

### Stage 3: E2B Sandbox (Isolated)

```typescript
// Spin up isolated environment
const sandbox = await CodeInterpreter.create({
  apiKey: config.E2B_API_KEY,
});

// Install MCP servers
await sandbox.notebook.execCell(`
  npm install -g @modelcontextprotocol/server-github
`);

// Execute analysis script
const findings = await sandbox.notebook.execCell(analysisScript);

// Cleanup
await sandbox.close();
```

**Capabilities:**
- Isolated Python/Node.js environment
- MCP tool access (GitHub, filesystem)
- Security scanner integration (semgrep, trufflehog)
- Safe code execution

**Security:**
- No network access to internal systems
- Ephemeral sandboxes (destroyed after use)
- Resource limits (CPU, memory, time)

### Stage 4: Groq AI Analysis (Intelligent)

```typescript
// AI-powered validation and suggestions
const completion = await groq.chat.completions.create({
  model: "llama-3.1-70b-versatile",
  messages: [
    {
      role: "system",
      content: COMPLIANCE_EXPERT_PROMPT,
    },
    {
      role: "user",
      content: buildAnalysisPrompt(files, rules),
    },
  ],
  response_format: { type: "json_object" },
});
```

**Features:**
- Validates findings from rules engine
- Provides context-aware fix suggestions
- Detects complex security issues
- Explains compliance violations

**Optimizations:**
- Batch file analysis (5 files per request)
- Temperature: 0.1 (consistent output)
- JSON mode for structured responses
- Caching for repeated analyses

### Stage 5: Results Aggregation

```typescript
// Combine all findings
const allFindings = [
  ...ruleFindings,
  ...e2bFindings,
  ...groqFindings,
];

// Deduplicate by (file, line, type, message)
const uniqueFindings = deduplicateFindings(allFindings);

// Calculate statistics
const stats = calculateStats(uniqueFindings);
```

### Stage 6: GitHub Integration

```typescript
// Post summary comment
await octokit.issues.createComment({
  owner,
  repo,
  issue_number: prNumber,
  body: generateSummaryComment(result),
});

// Post inline comments for critical issues
for (const finding of criticalFindings) {
  await octokit.pulls.createReviewComment({
    owner,
    repo,
    pull_number: prNumber,
    body: formatFindingComment(finding),
    commit_id: headSha,
    path: finding.file,
    line: finding.line,
  });
}

// Update check run status
await octokit.checks.update({
  owner,
  repo,
  check_run_id: checkRunId,
  status: "completed",
  conclusion: getConclusion(stats),
});
```

## Data Models

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

## MCP Integration

### GitHub MCP

```javascript
// MCP server running in E2B sandbox
const githubMCP = {
  command: 'npx',
  args: ['-y', '@modelcontextprotocol/server-github'],
  env: {
    GITHUB_PERSONAL_ACCESS_TOKEN: installationToken,
  },
};
```

**Available Tools:**
- `github_get_file_contents`: Fetch file from PR
- `github_list_commits`: Get PR commits
- `github_create_review_comment`: Post inline comments

### Filesystem MCP

```javascript
const filesystemMCP = {
  command: 'npx',
  args: ['-y', '@modelcontextprotocol/server-filesystem', '/workspace'],
};
```

**Available Tools:**
- `read_file`: Read file from sandbox
- `write_file`: Write file to sandbox
- `list_directory`: List directory contents

## Security Architecture

### Authentication & Authorization

```typescript
// GitHub App authentication
const app = new App({
  appId: config.GITHUB_APP_ID,
  privateKey: config.GITHUB_APP_PRIVATE_KEY,
});

// Installation-specific token
const octokit = await app.getInstallationOctokit(installationId);
```

### Webhook Verification

```typescript
// HMAC SHA-256 signature verification
function verifyWebhookSignature(payload: string, signature: string): boolean {
  const hmac = crypto.createHmac('sha256', webhookSecret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
```

### Secrets Management

- Environment variables for sensitive data
- No secrets in code or version control
- GitHub App private key rotation supported
- Database credentials encrypted at rest

### Rate Limiting

```nginx
# nginx.conf
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=webhook_limit:10m rate=30r/m;
```

## Performance Optimizations

### Caching Strategy

```typescript
// Redis caching
const cache = {
  // Analysis results (1 hour)
  analysis: { ttl: 3600 },
  
  // Repository configuration (5 minutes)
  repoConfig: { ttl: 300 },
  
  // Custom rules (10 minutes)
  rules: { ttl: 600 },
};
```

### Database Indexing

```sql
-- Critical indexes for performance
CREATE INDEX idx_analyses_repo ON analyses(repo_full_name);
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX idx_findings_analysis_id ON findings(analysis_id);
CREATE INDEX idx_findings_severity ON findings(severity);
```

### Async Processing

```typescript
// BullMQ job queue
const analysisQueue = new Queue('pr-analysis', {
  connection: redis,
});

// Add job
await analysisQueue.add('analyze-pr', {
  owner,
  repo,
  prNumber,
});

// Worker processes jobs concurrently
const worker = new Worker('pr-analysis', async (job) => {
  await analyzePR(job.data);
});
```

## Scalability

### Horizontal Scaling

```yaml
# docker-compose.yml
backend:
  replicas: 3
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 2G
```

### Load Balancing

```nginx
upstream backend {
  server backend-1:3001;
  server backend-2:3001;
  server backend-3:3001;
}
```

### Database Connection Pooling

```typescript
const pool = new Pool({
  max: 20, // Max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## Monitoring & Observability

### Health Checks

```typescript
// Backend health endpoint
GET /health
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "e2b": "configured",
    "groq": "configured"
  }
}
```

### Logging

```typescript
// Winston logger
logger.info('PR analysis started', {
  owner,
  repo,
  prNumber,
  files: files.length,
});

logger.error('Analysis failed', {
  error: error.message,
  stack: error.stack,
  context: { owner, repo, prNumber },
});
```

### Metrics

- Analysis duration (avg, p50, p95, p99)
- Findings per PR (by severity)
- E2B sandbox usage (cost tracking)
- Groq API usage (tokens, latency)
- Webhook processing time

## Error Handling

### Graceful Degradation

```typescript
try {
  // Stage 3: E2B analysis
  const e2bFindings = await e2bAgent.analyze(context);
  findings.push(...e2bFindings);
} catch (error) {
  logger.error('E2B analysis failed', error);
  // Continue with other stages
}

try {
  // Stage 4: Groq analysis
  const groqFindings = await groqAnalyzer.analyze(files);
  findings.push(...groqFindings);
} catch (error) {
  logger.error('Groq analysis failed', error);
  // Continue with available findings
}
```

### Retry Logic

```typescript
// Exponential backoff for external APIs
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(Math.pow(2, i) * 1000);
    }
  }
  throw new Error('Max retries exceeded');
}
```

## Deployment Architecture

### Production Setup

```
┌─────────────────────────────────────────────────┐
│                  Cloudflare CDN                 │
│              (SSL, DDoS Protection)             │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│                    Nginx                        │
│           (Reverse Proxy, Rate Limiting)        │
└───────────┬─────────────────┬───────────────────┘
            │                 │
            ▼                 ▼
    ┌──────────────┐   ┌──────────────┐
    │   Frontend   │   │   Backend    │
    │   (Vercel)   │   │  (Railway)   │
    └──────────────┘   └───────┬──────┘
                               │
                ┌──────────────┼──────────────┐
                ▼              ▼              ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │PostgreSQL│   │  Redis   │   │   E2B    │
        │(Railway) │   │(Railway) │   │  Cloud   │
        └──────────┘   └──────────┘   └──────────┘
```

## Best Practices

1. **Always destroy E2B sandboxes** after analysis to avoid costs
2. **Cache Groq responses** for identical code to reduce API calls
3. **Use database indexes** for frequently queried fields
4. **Implement rate limiting** to prevent abuse
5. **Log all webhook events** for debugging and audit
6. **Monitor E2B sandbox costs** and set alerts
7. **Use connection pooling** for database and Redis
8. **Implement graceful shutdown** to finish in-flight analyses
9. **Version control database schema** with migrations
10. **Test with demo repositories** before deploying to production

---

**Last updated:** 2024-01-01

