# Deployment Guide

This guide covers deploying AI Compliance Copilot to production.

## Prerequisites

- Docker and Docker Compose
- PostgreSQL database
- Redis instance
- GitHub App credentials
- E2B API key
- Groq API key

## Environment Variables

Create a `.env` file with the following variables:

```bash
# Backend
E2B_API_KEY=your_e2b_api_key
GROQ_API_KEY=your_groq_api_key
GITHUB_APP_ID=your_github_app_id
GITHUB_APP_PRIVATE_KEY=your_github_private_key
GITHUB_WEBHOOK_SECRET=your_webhook_secret
DATABASE_URL=postgresql://user:pass@host:5432/compliance_copilot
REDIS_URL=redis://host:6379
PORT=3001
NODE_ENV=production

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_GITHUB_APP_NAME=compliance-copilot
```

## GitHub App Setup

### 1. Create GitHub App

Visit https://github.com/settings/apps/new and create a new GitHub App:

**Basic Information:**
- Name: `Compliance Copilot`
- Homepage URL: `https://compliance-copilot.com`
- Webhook URL: `https://api.compliance-copilot.com/api/webhook`
- Webhook Secret: Generate a secure random string

**Permissions:**

Repository permissions:
- Contents: Read & write
- Pull requests: Read & write
- Issues: Read & write
- Metadata: Read

Subscribe to events:
- Pull request
- Issue comment
- Push

### 2. Generate Private Key

After creating the app:
1. Click "Generate a private key"
2. Download the `.pem` file
3. Convert to environment variable format:
```bash
cat private-key.pem | tr '\n' '\n' > private-key-formatted.txt
```

### 3. Install App

Install the app on your repositories to enable compliance checking.

## Deployment Options

### Option 1: Docker Compose (Recommended for Self-Hosting)

```bash
# Clone repository
git clone https://github.com/yourusername/ai-compliance-copilot.git
cd ai-compliance-copilot

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f backend

# Run database migrations
docker-compose exec backend npm run migrate
```

### Option 2: Railway (Recommended for Backend)

1. Install Railway CLI:
```bash
npm install -g @railway/cli
railway login
```

2. Create new project:
```bash
railway init
railway add
```

3. Add PostgreSQL and Redis:
```bash
railway add postgres
railway add redis
```

4. Configure environment variables:
```bash
railway variables set E2B_API_KEY=your_key
railway variables set GROQ_API_KEY=your_key
railway variables set GITHUB_APP_ID=your_id
railway variables set GITHUB_APP_PRIVATE_KEY="$(cat private-key.pem)"
railway variables set GITHUB_WEBHOOK_SECRET=your_secret
```

5. Deploy:
```bash
railway up
```

### Option 3: Vercel (Recommended for Frontend)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy frontend:
```bash
cd frontend
vercel --prod
```

3. Configure environment variables in Vercel dashboard:
- `NEXT_PUBLIC_API_URL`: Your backend URL
- `NEXT_PUBLIC_GITHUB_APP_NAME`: Your GitHub App name

### Option 4: AWS/GCP/Azure

#### AWS Deployment (ECS + RDS)

1. **Setup RDS PostgreSQL:**
```bash
aws rds create-db-instance \
  --db-instance-identifier compliance-copilot-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password <password> \
  --allocated-storage 20
```

2. **Setup ElastiCache Redis:**
```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id compliance-copilot-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

3. **Deploy to ECS:**
```bash
# Build and push Docker images
docker build -t compliance-copilot-backend ./backend
docker tag compliance-copilot-backend:latest <aws-account>.dkr.ecr.<region>.amazonaws.com/compliance-copilot-backend:latest
docker push <aws-account>.dkr.ecr.<region>.amazonaws.com/compliance-copilot-backend:latest

# Create ECS service
aws ecs create-service \
  --cluster compliance-copilot \
  --service-name backend \
  --task-definition compliance-copilot-backend \
  --desired-count 2
```

## Database Migrations

Run migrations after deployment:

```bash
# Local
npm run migrate --workspace=backend

# Docker
docker-compose exec backend npm run migrate

# Railway
railway run npm run migrate
```

## Monitoring & Logging

### Health Checks

Backend health endpoint: `GET /health`

Expected response:
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

### Logging

Logs are written to:
- `backend/logs/error.log` - Error logs
- `backend/logs/combined.log` - All logs

Configure log level via `LOG_LEVEL` environment variable:
- `error` - Only errors
- `warn` - Warnings and errors
- `info` - Info, warnings, and errors (default)
- `debug` - All logs including debug

### Monitoring Endpoints

- `/health` - Basic health check
- `/api/stats` - Compliance statistics
- Prometheus metrics (optional): `/metrics`

## Security Considerations

### 1. Webhook Signature Verification

All GitHub webhooks are verified using HMAC SHA-256. The verification happens automatically in the backend.

### 2. Rate Limiting

Rate limits are configured in `nginx.conf`:
- API: 10 requests/second
- Webhooks: 30 requests/minute

### 3. Secrets Management

**Never commit secrets to Git!**

Use environment variables or secret management services:
- AWS Secrets Manager
- HashiCorp Vault
- Railway/Vercel environment variables

### 4. SSL/TLS

Always use HTTPS in production. Configure SSL certificates:

```bash
# Let's Encrypt with certbot
certbot certonly --nginx -d compliance-copilot.com
```

## Scaling

### Horizontal Scaling

The backend is stateless and can be horizontally scaled:

```yaml
# docker-compose.yml
backend:
  deploy:
    replicas: 3
```

### Database Connection Pooling

Configure connection pool in backend:

```typescript
// backend/src/db/client.ts
const pool = new Pool({
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Redis Queue

For handling many concurrent PRs, use Redis queue (BullMQ):

```typescript
// backend/src/queue/analysis-queue.ts
const analysisQueue = new Queue('pr-analysis', {
  connection: redis,
});
```

## Troubleshooting

### Common Issues

**1. Database connection failed**
- Check DATABASE_URL format
- Verify PostgreSQL is running
- Check firewall rules

**2. GitHub webhook not working**
- Verify webhook URL is publicly accessible
- Check webhook secret matches
- Review webhook delivery logs in GitHub

**3. E2B sandbox timeout**
- Check E2B API key is valid
- Verify network connectivity
- Check E2B service status

**4. Groq API errors**
- Verify API key is valid
- Check rate limits
- Monitor Groq service status

### Debug Mode

Enable debug logging:

```bash
LOG_LEVEL=debug npm run dev
```

### Testing Webhooks Locally

Use ngrok to test webhooks locally:

```bash
ngrok http 3001

# Update GitHub App webhook URL to:
# https://your-ngrok-url.ngrok.io/api/webhook
```

## Backup & Recovery

### Database Backups

**Automated backups:**

```bash
# Daily backup cron job
0 2 * * * pg_dump $DATABASE_URL > /backups/compliance_$(date +\%Y\%m\%d).sql
```

**Manual backup:**

```bash
pg_dump $DATABASE_URL > backup.sql
```

**Restore:**

```bash
psql $DATABASE_URL < backup.sql
```

### Configuration Backup

Backup custom rules and configuration:

```bash
# Export custom rules
curl https://api.compliance-copilot.com/api/config/rules > rules-backup.json
```

## Performance Optimization

### 1. Database Indexes

Ensure proper indexes (already in schema.sql):
- `analyses(repo_full_name)`
- `analyses(created_at DESC)`
- `findings(analysis_id)`

### 2. Caching

Implement Redis caching for:
- Analysis results (TTL: 1 hour)
- Repository configurations (TTL: 5 minutes)
- Custom rules (TTL: 10 minutes)

### 3. E2B Sandbox Optimization

- Reuse sandboxes when possible
- Implement timeout limits (default: 5 minutes)
- Clean up sandboxes after analysis

## Cost Optimization

### E2B Usage

Monitor E2B sandbox usage:
- Average analysis: ~30 seconds
- Cost per analysis: ~$0.01
- Optimize by batching files

### Groq API

Groq is very cost-effective:
- ~$0.001 per analysis
- Use caching to reduce API calls
- Batch file analysis

### Infrastructure

Recommended production setup costs:
- Backend (Railway/Heroku): $7-25/month
- Frontend (Vercel): Free-$20/month
- Database (Railway Postgres): $5-10/month
- Redis (Railway Redis): $5/month

**Total: ~$20-60/month for small teams**

## Support

For deployment issues:
- Check documentation: `/docs`
- Review logs: `docker-compose logs`
- Open issue: GitHub Issues

---

**Last updated:** 2024-01-01

