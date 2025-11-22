# Database Setup Guide

This guide explains how to set up the PostgreSQL database, configure the DATABASE_URL, and run migrations.

## Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Start the PostgreSQL database:**
```bash
docker-compose up -d postgres
```

2. **Get the DATABASE_URL:**
The DATABASE_URL for the Docker Compose setup is:
```
postgresql://postgres:postgres@localhost:5432/compliance_copilot
```

3. **Set the environment variable:**
Create a `.env` file in the project root or backend directory:
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/compliance_copilot
```

4. **Run migrations:**
```bash
cd backend
npm run migrate
```

Or from the project root:
```bash
npm run migrate --workspace=backend
```

### Option 2: Using Docker Compose (All Services)

If you want to start all services including the database:

```bash
docker-compose up -d
```

Then run migrations:
```bash
docker-compose exec backend npm run migrate
```

## DATABASE_URL Format

The DATABASE_URL follows this format:
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

### Examples:

**Local Docker Compose:**
```
postgresql://postgres:postgres@localhost:5432/compliance_copilot
```

**From within Docker container:**
```
postgresql://postgres:postgres@postgres:5432/compliance_copilot
```

**Remote PostgreSQL:**
```
postgresql://username:password@db.example.com:5432/compliance_copilot
```

**With SSL:**
```
postgresql://username:password@db.example.com:5432/compliance_copilot?sslmode=require
```

## Manual PostgreSQL Setup

If you prefer to run PostgreSQL manually (without Docker):

### macOS (using Homebrew)

1. **Install PostgreSQL:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

2. **Create the database:**
```bash
createdb compliance_copilot
```

3. **Set DATABASE_URL:**
```bash
export DATABASE_URL=postgresql://$(whoami)@localhost:5432/compliance_copilot
```

Or add to your `.env` file:
```
DATABASE_URL=postgresql://your_username@localhost:5432/compliance_copilot
```

### Linux (Ubuntu/Debian)

1. **Install PostgreSQL:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

2. **Start PostgreSQL service:**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

3. **Create database and user:**
```bash
sudo -u postgres psql
```

Then in the PostgreSQL prompt:
```sql
CREATE DATABASE compliance_copilot;
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE compliance_copilot TO your_username;
\q
```

4. **Set DATABASE_URL:**
```bash
export DATABASE_URL=postgresql://your_username:your_password@localhost:5432/compliance_copilot
```

### Windows

1. **Download and install PostgreSQL** from https://www.postgresql.org/download/windows/

2. **Create database using pgAdmin** or command line:
```bash
psql -U postgres
CREATE DATABASE compliance_copilot;
```

3. **Set DATABASE_URL** in your `.env` file:
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/compliance_copilot
```

## Running Migrations

### Local Development

From the backend directory:
```bash
cd backend
npm run migrate
```

From the project root:
```bash
npm run migrate --workspace=backend
```

### With Docker Compose

If services are running in Docker:
```bash
docker-compose exec backend npm run migrate
```

### Verify Migration Success

After running migrations, you can verify the tables were created:

```bash
# Using psql
psql $DATABASE_URL -c "\dt"

# Or using Docker
docker-compose exec postgres psql -U postgres -d compliance_copilot -c "\dt"
```

You should see these tables:
- `analyses`
- `findings`
- `custom_rules`
- `repo_configs`

## Troubleshooting

### Database Connection Failed

**Error:** `Error: DATABASE_URL environment variable is not set`

**Solution:** Make sure you have a `.env` file with DATABASE_URL set, or export it in your shell:
```bash
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/compliance_copilot
```

### Connection Refused

**Error:** `Connection refused` or `ECONNREFUSED`

**Solutions:**
1. Check if PostgreSQL is running:
   ```bash
   # Docker
   docker-compose ps postgres
   
   # macOS/Linux
   brew services list  # macOS
   sudo systemctl status postgresql  # Linux
   ```

2. Verify the port is correct (default: 5432)

3. Check if the database exists:
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```

### Authentication Failed

**Error:** `password authentication failed`

**Solutions:**
1. Verify username and password in DATABASE_URL
2. For Docker Compose, default credentials are:
   - Username: `postgres`
   - Password: `postgres`
   - Database: `compliance_copilot`

3. Reset Docker Compose database (⚠️ This will delete all data):
   ```bash
   docker-compose down -v
   docker-compose up -d postgres
   ```

### Migration Already Applied

**Error:** `relation "analyses" already exists`

**Solution:** This is normal if migrations have already been run. The migration script uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times.

### Permission Denied

**Error:** `permission denied for database`

**Solution:** Grant proper permissions:
```sql
GRANT ALL PRIVILEGES ON DATABASE compliance_copilot TO your_username;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username;
```

## Environment Variables

Create a `.env` file in the project root or backend directory:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/compliance_copilot

# Redis (optional for local dev)
REDIS_URL=redis://localhost:6379

# Other required variables
E2B_API_KEY=your_e2b_api_key
GROQ_API_KEY=your_groq_api_key
GITHUB_APP_ID=your_github_app_id
GITHUB_APP_PRIVATE_KEY=your_private_key
GITHUB_WEBHOOK_SECRET=your_webhook_secret
```

## Database Schema

The migration creates the following tables:

- **analyses** - Stores PR analysis results
- **findings** - Stores individual compliance findings
- **custom_rules** - Stores user-defined compliance rules
- **repo_configs** - Stores repository-specific configurations

See `backend/src/db/schema.sql` for the complete schema definition.

## Next Steps

After setting up the database:

1. ✅ Database is running
2. ✅ DATABASE_URL is configured
3. ✅ Migrations are complete
4. 🚀 Start the backend: `npm run dev --workspace=backend`
5. 🚀 Start the frontend: `npm run dev --workspace=frontend`

