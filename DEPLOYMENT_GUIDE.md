# 🚀 Deployment Guide - Maya Travel Agent

## Table of Contents
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Setup](#environment-setup)
- [Deployment Options](#deployment-options)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Rollback Procedures](#rollback-procedures)

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing
- [ ] No linting errors
- [ ] Type checking passed
- [ ] Code reviewed and approved
- [ ] Documentation updated

```bash
# Run all checks
cd frontend
npm run test
npm run lint
npm run type-check
npm run build

cd ../backend
node test-rate-limits.js
```

### Security

- [ ] Environment variables secured
- [ ] API keys rotated
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] No secrets in code

### Performance

- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Database indexed
- [ ] Caching configured
- [ ] Compression enabled

### Configuration

- [ ] Production environment variables set
- [ ] Database migrations ready
- [ ] SSL certificates configured
- [ ] Domain DNS configured
- [ ] Monitoring tools setup

---

## Environment Setup

### Production Environment Variables

#### Backend (.env.production)

```env
# Server
NODE_ENV=production
PORT=5000

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# AI Service
ZAI_API_KEY=your_production_zai_api_key
ZAI_API_BASE_URL=https://api.z.ai/api/paas/v4
ZAI_MODEL=glm-4.6

# Telegram
TELEGRAM_BOT_TOKEN=your_production_bot_token

# Payment
STRIPE_SECRET_KEY=your_production_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
PAYPAL_CLIENT_ID=your_production_paypal_id

# WhatsApp
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token

# Security
JWT_SECRET=your_strong_jwt_secret_min_32_chars
FRONTEND_URL=https://your-domain.com

# Monitoring
LOG_LEVEL=error
SENTRY_DSN=your_sentry_dsn
```

#### Frontend (.env.production)

```env
VITE_API_URL=https://api.your-domain.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

---

## Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Frontend Deployment (Vercel)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy Frontend**
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Configure Environment Variables**
   - Go to Vercel Dashboard
   - Project Settings → Environment Variables
   - Add all VITE_* variables

5. **Configure Build Settings**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "installCommand": "npm install",
     "framework": "vite"
   }
   ```

#### Backend Deployment (Railway)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   cd backend
   railway init
   ```

4. **Add Environment Variables**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set PORT=5000
   # Add all other variables
   ```

5. **Deploy**
   ```bash
   railway up
   ```

6. **Configure Domain**
   - Go to Railway Dashboard
   - Settings → Domains
   - Add custom domain

---

### Option 2: Netlify (Frontend) + Render (Backend)

#### Frontend Deployment (Netlify)

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**
   ```bash
   netlify login
   ```

3. **Deploy**
   ```bash
   cd frontend
   netlify deploy --prod
   ```

4. **Configure Build**
   Create `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

#### Backend Deployment (Render)

1. **Create render.yaml**
   ```yaml
   services:
     - type: web
       name: maya-backend
       env: node
       buildCommand: npm install
       startCommand: node server.js
       envVars:
         - key: NODE_ENV
           value: production
         - key: PORT
           value: 5000
   ```

2. **Deploy via Dashboard**
   - Connect GitHub repository
   - Select backend directory
   - Add environment variables
   - Deploy

---

### Option 3: Docker Deployment

#### Create Dockerfiles

**Frontend Dockerfile**:
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Backend Dockerfile**:
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

EXPOSE 5000
CMD ["node", "server.js"]
```

**Docker Compose**:
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=http://backend:5000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
    env_file:
      - backend/.env.production
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
```

**Deploy with Docker**:
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

### Option 4: VPS Deployment (Ubuntu)

#### Server Setup

1. **Update System**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

3. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

4. **Install Nginx**
   ```bash
   sudo apt install -y nginx
   ```

5. **Setup Firewall**
   ```bash
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

#### Application Deployment

1. **Clone Repository**
   ```bash
   cd /var/www
   git clone https://github.com/Moeabdelaziz007/maya-travel-agent.git
   cd maya-travel-agent
   ```

2. **Install Dependencies**
   ```bash
   npm run install:all
   ```

3. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

4. **Configure Environment**
   ```bash
   cd ../backend
   cp env.example .env
   # Edit .env with production values
   nano .env
   ```

5. **Start Backend with PM2**
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

6. **Configure Nginx**
   ```nginx
   # /etc/nginx/sites-available/maya-trips
   server {
       listen 80;
       server_name your-domain.com;
       
       # Frontend
       location / {
           root /var/www/maya-travel-agent/frontend/dist;
           try_files $uri $uri/ /index.html;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/maya-trips /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm run install:all
      
      - name: Run tests
        run: |
          cd frontend
          npm run test
          npm run lint
          npm run type-check
      
      - name: Build
        run: |
          cd frontend
          npm run build

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./frontend

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: maya-backend
```

---

## Database Migrations

### Running Migrations

1. **Create Migration File**
   ```sql
   -- migrations/001_initial_schema.sql
   -- Run this in Supabase SQL Editor
   ```

2. **Apply Migration**
   ```bash
   # Using Supabase CLI
   supabase db push
   
   # Or manually in Supabase Dashboard
   # SQL Editor → Run migration
   ```

3. **Verify Migration**
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

---

## Monitoring & Maintenance

### Health Checks

1. **Setup Health Check Endpoint**
   ```javascript
   // Already implemented in server.js
   app.get('/api/health', (req, res) => {
     res.json({
       status: 'healthy',
       timestamp: new Date().toISOString(),
       uptime: process.uptime()
     });
   });
   ```

2. **Monitor with UptimeRobot**
   - Add monitor for https://api.your-domain.com/api/health
   - Set check interval to 5 minutes
   - Configure alerts

### Logging

1. **Winston Logger Setup**
   ```javascript
   const winston = require('winston');
   
   const logger = winston.createLogger({
     level: process.env.LOG_LEVEL || 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ 
         filename: 'logs/error.log', 
         level: 'error' 
       }),
       new winston.transports.File({ 
         filename: 'logs/combined.log' 
       })
     ]
   });
   ```

2. **View Logs**
   ```bash
   # PM2 logs
   pm2 logs maya-backend
   
   # File logs
   tail -f backend/logs/error.log
   tail -f backend/logs/combined.log
   ```

### Performance Monitoring

1. **Setup Sentry**
   ```javascript
   const Sentry = require('@sentry/node');
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV
   });
   ```

2. **Monitor Metrics**
   - Response times
   - Error rates
   - Memory usage
   - CPU usage
   - Database connections

---

## Rollback Procedures

### Quick Rollback

1. **Identify Last Good Deployment**
   ```bash
   git log --oneline -10
   ```

2. **Revert to Previous Version**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Or Rollback to Specific Commit**
   ```bash
   git reset --hard <commit-hash>
   git push origin main --force
   ```

### Platform-Specific Rollback

**Vercel**:
```bash
vercel rollback
```

**Railway**:
- Go to Dashboard → Deployments
- Click on previous deployment
- Click "Redeploy"

**PM2**:
```bash
pm2 reload ecosystem.config.js --env production
```

---

## Post-Deployment Verification

### Checklist

- [ ] Frontend loads correctly
- [ ] API endpoints responding
- [ ] Database connections working
- [ ] Authentication working
- [ ] Payment system functional
- [ ] Telegram bot responding
- [ ] Rate limiting active
- [ ] SSL certificate valid
- [ ] Monitoring active
- [ ] Logs being generated

### Testing Commands

```bash
# Test API health
curl https://api.your-domain.com/api/health

# Test frontend
curl https://your-domain.com

# Test AI endpoint
curl -X POST https://api.your-domain.com/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'

# Test rate limiting
for i in {1..15}; do 
  curl https://api.your-domain.com/api/ai/chat
done
```

---

## Backup & Recovery

### Database Backup

```bash
# Supabase automatic backups (enabled by default)
# Manual backup via Supabase Dashboard:
# Database → Backups → Create Backup
```

### Application Backup

```bash
# Backup code
git clone https://github.com/Moeabdelaziz007/maya-travel-agent.git backup-$(date +%Y%m%d)

# Backup environment variables
cp backend/.env backend/.env.backup-$(date +%Y%m%d)
```

---

## Troubleshooting Deployment Issues

### Build Failures

```bash
# Clear cache
rm -rf node_modules dist .next

# Reinstall
npm ci

# Rebuild
npm run build
```

### Environment Variable Issues

```bash
# Verify variables are set
printenv | grep VITE_
printenv | grep NODE_ENV

# Test with variables
NODE_ENV=production npm run build
```

### SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew

# Test certificate
sudo certbot certificates
```

---

**Last Updated**: 2024-10-09  
**Version**: 1.0.0  
**Maintained by**: Maya Trips Team
