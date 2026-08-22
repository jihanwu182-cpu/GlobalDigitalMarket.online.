# Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Docker Deployment](#docker-deployment)
4. [Staging Deployment](#staging-deployment)
5. [Production Deployment](#production-deployment)
6. [Database Migrations](#database-migrations)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools
- Git
- Docker & Docker Compose
- Node.js 18+
- PostgreSQL 13+ (for local development)
- Redis 6+ (for local development)
- SSH access to staging/production servers

### System Requirements
- **Development**: 4GB RAM, 20GB disk
- **Staging**: 8GB RAM, 50GB disk
- **Production**: 16GB RAM, 100GB disk+

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/jihanwu182-cpu/GlobalMarket.com.git
cd GlobalMarket.com
```

### 2. Environment Configuration

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your local settings

# Frontend
cd ../frontend
cp .env.example .env
# REACT_APP_API_URL should point to http://localhost:5000/api
```

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Setup Database

```bash
# Create PostgreSQL database
createdb globalmarket

# Run migrations
cd backend
npm run migrate

# Seed initial data
npm run seed
```

### 5. Start Development Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev
# Server runs on http://localhost:5000

# Terminal 2: Frontend
cd frontend
npm start
# App opens at http://localhost:3000
```

## Docker Deployment

### 1. Build Docker Images

```bash
# Build all services
docker-compose build

# Or build specific service
docker-compose build backend
docker-compose build frontend
```

### 2. Start Services

```bash
# Start all services in background
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
```

### 3. Access Services

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### 4. Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Staging Deployment

### 1. Provision Staging Server

#### Using AWS EC2

```bash
# Create Ubuntu 22.04 LTS instance
# Security group: Allow SSH (22), HTTP (80), HTTPS (443), Port 3000, Port 5000

# Connect to instance
ssh -i your-key.pem ubuntu@your-staging-host

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install -y git

# Create deploy user
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG docker deploy
```

### 2. Setup Deployment SSH Key

```bash
# On your local machine
ssh-keygen -t ed25519 -f ~/.ssh/staging-deploy-key -N ""

# Copy public key to server
ssh-copy-id -i ~/.ssh/staging-deploy-key.pub deploy@your-staging-host

# Add private key to GitHub Secrets
cat ~/.ssh/staging-deploy-key  # Copy this
# Paste into: GitHub > Settings > Secrets > STAGING_DEPLOY_KEY
```

### 3. Clone Repository on Server

```bash
sudo -u deploy bash
cd /home/deploy
git clone https://github.com/jihanwu182-cpu/GlobalMarket.com.git app
cd app
```

### 4. Configure Environment

```bash
# Create environment file
cat > .env << EOF
NODE_ENV=staging
DB_HOST=postgres
DB_PORT=5432
DB_NAME=globalmarket
DB_USER=postgres
DB_PASSWORD=change_me_in_production
JWT_SECRET=your-secret-key-change-me
CORS_ORIGIN=https://staging.yourdomain.com
REACT_APP_API_URL=https://staging.yourdomain.com/api
EOF

# Create docker-compose override for staging
cat > docker-compose.override.yml << EOF
version: '3.8'

services:
  backend:
    environment:
      NODE_ENV: staging
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "5000:5000"

  frontend:
    environment:
      REACT_APP_API_URL: https://staging.yourdomain.com/api
EOF
```

### 5. Deploy

```bash
# Pull latest code
git pull origin main

# Build images
docker-compose build

# Start services
docker-compose up -d

# Run migrations
docker-compose exec backend npm run migrate

# View logs
docker-compose logs -f
```

### 6. Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Create config
sudo tee /etc/nginx/sites-available/globalmarket << EOF
upstream backend {
    server localhost:5000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name staging.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name staging.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/staging.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/staging.yourdomain.com/privkey.pem;

    # API routes
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/globalmarket /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Setup SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --standalone -d staging.yourdomain.com

# Setup auto-renewal
sudo systemctl enable certbot.timer
```

## Production Deployment

### 1. Production Server Setup

Follow similar steps as staging, but:
- Use stronger database passwords
- Enable WAF (AWS WAF or Cloudflare)
- Setup database backups
- Enable monitoring and logging
- Use managed PostgreSQL if possible (AWS RDS)
- Use managed Redis (AWS ElastiCache)

### 2. Environment Configuration

```bash
# .env for production
cat > .env << EOF
NODE_ENV=production
PORT=5000
DB_HOST=db.yourdomain.com  # Managed database
DB_PORT=5432
DB_NAME=globalmarket_prod
DB_USER=prod_user
DB_PASSWORD=very-strong-password
DB_SSL=true
JWT_SECRET=very-long-random-secret-key
CORS_ORIGIN=https://app.yourdomain.com
REACT_APP_API_URL=https://api.yourdomain.com
LOG_LEVEL=error
NODE_ENV=production
EOF
```

### 3. Deploy

```bash
# Tag release
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0

# This triggers GitHub Actions release workflow
# Automatic deployment to production
```

### 4. Post-Deployment Verification

```bash
# Check services
docker-compose ps

# Verify database
docker-compose exec postgres psql -U postgres -d globalmarket -c "SELECT version();"

# Check application logs
docker-compose logs --tail=100

# Run health check
curl https://api.yourdomain.com/health
```

## Database Migrations

### Running Migrations

```bash
# Inside container
docker-compose exec backend npm run migrate

# Manual migration
docker-compose exec backend node migrations/migrate.js
```

### Creating New Migration

```bash
# 1. Create SQL file
touch backend/migrations/002_add_new_table.sql

# 2. Add SQL
cat > backend/migrations/002_add_new_table.sql << EOF
CREATE TABLE new_table (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOF

# 3. Run migrations
docker-compose exec backend npm run migrate
```

### Backup Database

```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U postgres globalmarket > backup.sql

# Restore from backup
docker-compose exec postgres psql -U postgres globalmarket < backup.sql
```

## Monitoring & Maintenance

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100
```

### Monitor Resources

```bash
# CPU, Memory, Network
docker stats

# System resources
free -h
disk_free
```

### Database Maintenance

```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d globalmarket

# Analyze query performance
EXPLAIN ANALYZE SELECT * FROM users;

# Vacuum and analyze
VACUUM ANALYZE;

# Exit
\q
```

### Update Services

```bash
# Pull latest code
git pull origin main

# Rebuild images
docker-compose build

# Restart services
docker-compose up -d

# Check status
docker-compose ps
```

## Troubleshooting

### Database Connection Failed

```bash
# Check if postgres is running
docker-compose ps postgres

# View postgres logs
docker-compose logs postgres

# Verify connection
docker-compose exec postgres psql -U postgres -c "SELECT 1"
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a

# Remove old logs
find . -name '*.log' -mtime +30 -delete
```

### Application Not Starting

```bash
# View detailed logs
docker-compose logs -f backend

# Rebuild images
docker-compose build --no-cache

# Restart all services
docker-compose restart
```

### Memory Issues

```bash
# Increase Docker memory limit
# Edit docker-compose.yml:
# services:
#   backend:
#     deploy:
#       resources:
#         limits:
#           memory: 2G

# Restart services
docker-compose up -d
```

## Rollback Procedure

```bash
# List available versions
git tag

# Checkout previous version
git checkout v0.9.0

# Rebuild and restart
docker-compose build
docker-compose up -d

# Verify
curl https://api.yourdomain.com/health
```

## Security Checklist

- [ ] SSH keys configured
- [ ] Database passwords changed
- [ ] JWT secret updated
- [ ] SSL certificates installed
- [ ] Firewall rules configured
- [ ] Database backups enabled
- [ ] Monitoring alerts setup
- [ ] Log aggregation configured
- [ ] Rate limiting enabled
- [ ] CORS origin restricted

## Support & Documentation

- GitHub Issues: https://github.com/jihanwu182-cpu/GlobalMarket.com/issues
- Docker Docs: https://docs.docker.com
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Node.js Docs: https://nodejs.org/en/docs/
