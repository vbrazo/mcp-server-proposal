# AI Compliance Copilot - Winning Hackathon Architecture

## Project Overview

An AI-powered compliance assistant that automatically analyzes GitHub PRs for security vulnerabilities, license compliance, code quality issues, and custom company rules. Works both automatically (webhook-driven) and interactively (via PR comments).

## Architecture Components

### 1. Project Structure

Create new directory: `/Users/vitoroliveira/strides/compliance-copilot/` with:

```
compliance-copilot/
├── backend/                 # Node.js/TypeScript API + E2B agent
├── frontend/               # Next.js landing page + dashboard
├── demo-repos/             # Sample repos with compliance issues
├── docs/                   # Documentation
└── README.md              # Main project README
```

### 2. Backend Architecture (`/backend`)

**Tech Stack:**

- Node.js + TypeScript + Express
- E2B Sandbox SDK (runs MCP agents in isolated sandboxes)
- Groq SDK (fast AI inference for code analysis)
- Docker MCP Hub integrations:
  - GitHub MCP (PR management, comments, file reading)
  - Additional MCPs: filesystem, security scanning tools
- Octokit (GitHub API for webhooks)

**Key Components:**

- `src/agent/e2b-agent.ts` - E2B sandbox orchestration with MCP tools
- `src/analysis/groq-analyzer.ts` - AI-powered code analysis using Groq
- `src/compliance/rules-engine.ts` - Custom compliance rules (secrets, licenses, patterns)
- `src/github/webhook-handler.ts` - GitHub webhook processing
- `src/github/pr-handler.ts` - PR analysis coordinator
- `src/api/routes.ts` - REST API for dashboard
- `src/config/mcp-config.ts` - MCP tool configurations

**Compliance Checks (All 4 categories):**

1. **AI-powered:** Groq analyzes code for security vulnerabilities, code smells, logic issues
2. **MCP integrations:** GitHub MCP reads files, security scanning via Docker MCPs
3. **Custom rules:** Regex patterns for API keys, hardcoded secrets, banned dependencies, license compliance
4. **Combination:** AI validates findings from rules + suggests fixes

**Workflow:**

- PR opened/updated → webhook triggers → E2B sandbox spins up → MCPs analyze code → Groq provides AI insights → Opens PR with fixes OR comments with suggestions

### 3. Frontend Architecture (`/frontend`)

**Tech Stack:**

- Next.js 14 (App Router)
- TypeScript + Tailwind CSS
- Shadcn/ui components (reuse from your existing stack)
- React Hook Form + Zod validation
- Recharts for analytics

**Pages:**

1. **Landing Page** (`/`)

   - Hero section with demo video/GIF
   - Feature highlights (4 compliance types)
   - Live demo section showing real PR analysis
   - "How it works" with E2B + MCP architecture diagram
   - GitHub installation CTA

2. **Dashboard** (`/dashboard`)

   - Recent PR analyses list
   - Compliance statistics (issues found, fixed, severity breakdown)
   - Configuration panel for custom rules
   - Repository settings
   - Real-time analysis status

3. **Documentation** (`/docs`)

   - Setup guide
   - API reference
   - Custom rules configuration
   - MCP integrations explanation

### 4. Demo Repositories (`/demo-repos`)

Create 2-3 sample repos with **intentional** compliance issues:

**demo-repo-1: "vulnerable-ecommerce"**

- Hardcoded API keys in config files
- SQL injection vulnerability
- Outdated dependencies with known CVEs
- Missing license headers
- Poor error handling

**demo-repo-2: "corporate-backend"**

- AWS credentials in .env (committed)
- GPL license violation (using GPL lib in proprietary code)
- Code quality issues (long functions, high complexity)
- Missing security headers

**demo-repo-3: "crypto-wallet"**

- Weak cryptography usage
- Private keys in source code
- Insufficient input validation
- Dangerous use of eval()

### 5. Testing Strategy

**Backend Tests** (Jest + Supertest):

- `tests/unit/` - Rules engine, compliance checks (80%+ coverage)
- `tests/integration/` - E2B sandbox integration, MCP tool calls
- `tests/e2e/` - Full PR analysis workflow
- `tests/mocks/` - GitHub API mocks, Groq response mocks

**Frontend Tests** (Jest + Testing Library):

- Component tests for dashboard, landing page
- Integration tests for API calls
- Snapshot tests for UI consistency

**Target: 70%+ code coverage** (judges love this)

### 6. Documentation

**README.md** (root):

- Project overview with screenshots
- Architecture diagram (E2B + MCPs + Groq flow)
- Quick start guide
- Demo video embed
- Hackathon requirements checklist (E2B ✓, MCPs ✓)

**docs/ARCHITECTURE.md:**

- Technical deep dive
- E2B sandbox usage details
- MCP integrations explanation
- AI analysis approach

**docs/SETUP.md:**

- Environment setup
- GitHub App installation
- Configuration guide
- Deployment instructions

**docs/API.md:**

- REST API endpoints
- Webhook payload examples
- Dashboard API documentation

**docs/COMPLIANCE_RULES.md:**

- Built-in rules catalog
- Custom rule creation guide
- Examples

### 7. Demo Video Strategy (< 2 minutes)

**Script:**

1. **0-15s:** Problem statement (compliance is hard, manual reviews miss things)
2. **15-30s:** Solution overview (AI Copilot with E2B + MCPs)
3. **30-75s:** Live demo:

   - Show PR with issues in demo repo
   - Trigger bot via comment "@compliance-bot check"
   - Show E2B sandbox spinning up in logs
   - Show MCPs analyzing files
   - Show Groq AI analysis
   - Bot comments with findings + opens PR with fixes

4. **75-90s:** Dashboard showcase (stats, config panel)
5. **90-110s:** Technical highlights (E2B isolation, multiple MCPs, Groq speed)
6. **110-120s:** Call to action + GitHub link

### 8. Winning Differentiators

1. **Full-stack polish:** Not just a script - production-ready with UI
2. **Multiple MCPs:** Use 3-4 MCPs from Docker Hub (GitHub + security tools)
3. **AI + Rules hybrid:** Groq for intelligent analysis + deterministic rules
4. **Both modes:** Auto-scan + interactive via comments
5. **Real PR fixes:** Actually opens PRs with suggested fixes (not just comments)
6. **Comprehensive tests:** Shows engineering maturity
7. **Great documentation:** Easy for judges to understand and run
8. **Practical use case:** Solves real pain point for dev teams
9. **E2B showcase:** Demonstrates security benefits of sandboxed execution

### 9. Technical Quality Checklist

- [ ] TypeScript strict mode, no `any` types
- [ ] Error handling and logging throughout
- [ ] Environment variables for all secrets
- [ ] Rate limiting on API endpoints
- [ ] Input validation with Zod
- [ ] Graceful E2B sandbox cleanup
- [ ] Proper GitHub webhook signature verification
- [ ] Responsive UI design
- [ ] Loading states and error messages
- [ ] ESLint + Prettier configuration
- [ ] Git hooks for pre-commit linting

### 10. Deployment & Demo

**Backend:** Deploy to Railway/Render with E2B API keys

**Frontend:** Deploy to Vercel

**Demo repos:** Public GitHub repos with clear README

**GitHub App:** Create and configure for webhook delivery

**Live demo:** Have it running on your actual demo repos during judging so judges can interact with it in real-time.

## Implementation Priority

1. Core E2B + MCP integration with basic GitHub PR analysis
2. Groq AI analysis integration
3. Compliance rules engine (all 4 types)
4. GitHub webhook + comment handlers (both modes)
5. Backend tests + documentation
6. Frontend landing page
7. Frontend dashboard
8. Demo repositories with issues
9. Frontend tests
10. Demo video production
11. Final polish and deployment

This architecture positions your project as a technically excellent, innovative, and highly practical solution that demonstrates mastery of E2B, MCPs, and AI integration.
