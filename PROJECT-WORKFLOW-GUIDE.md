# 🏗️ Maya Travel Agent - Professional Workflow & Organization Guide

**Version:** 1.0.0
**Last Updated:** October 9, 2025
**Status:** Production Ready

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Project Structure & Organization](#-project-structure--organization)
3. [Development Environment Setup](#-development-environment-setup)
4. [Version Control & Collaboration](#-version-control--collaboration)
5. [Authentication & Data Management](#-authentication--data-management)
6. [Deployment Pipeline](#-deployment-pipeline)
7. [Automation & Best Practices](#-automation--best-practices)
8. [Monitoring & Security](#-monitoring--security)
9. [Documentation & Handover](#-documentation--handover)
10. [Troubleshooting Guide](#-troubleshooting-guide)

---

## 🎯 Project Overview

### **Maya Travel Agent** - AI-Powered Travel Assistant

**Tech Stack:**
- **Frontend:** React 18 + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend:** Node.js + Express + Supabase Edge Functions
- **Database:** Supabase PostgreSQL with RLS
- **Authentication:** Supabase Auth + Web3 Wallets
- **AI:** Custom AI integration with streaming responses
- **Payments:** Stripe integration
- **Deployment:** Vercel (Frontend) + Supabase (Backend)
- **Mobile:** Telegram Mini App + WhatsApp integration
- **Version Control:** GitHub with automated workflows

**Key Features:**
- 🧠 AI-powered travel recommendations
- 🗺️ Smart trip planning with visual maps
- 💰 Real-time budget tracking
- 📱 Cross-platform mobile support
- 🌍 Global destination database
- 📊 Analytics and reporting
- 🔐 Multi-provider authentication

---

## 🏛️ Project Structure & Organization

### **Root Directory Structure**

```
maya-travel-agent/
├── 📁 frontend/                 # React SPA (Vercel deployment)
│   ├── 📁 src/
│   │   ├── 📁 components/        # Reusable UI components
│   │   │   ├── 📁 ui/           # shadcn/ui components (45+)
│   │   │   ├── 📁 Auth/         # Authentication components
│   │   │   └── 📁 pages/        # Page-level components
│   │   ├── 📁 api/              # API service layer
│   │   ├── 📁 hooks/            # Custom React hooks
│   │   ├── 📁 lib/              # Utilities and configurations
│   │   ├── 📁 integrations/     # External service integrations
│   │   └── 📁 assets/           # Static assets
│   ├── 📁 public/               # Public static files
│   ├── 📄 vercel.json           # Vercel deployment config
│   └── 📄 package.json          # Frontend dependencies
├── 📁 backend/                  # Node.js API server
│   ├── 📁 src/
│   │   ├── 📁 routes/           # API route handlers
│   │   ├── 📁 ai/               # AI service integrations
│   │   └── 📁 whatsapp/         # WhatsApp integration
│   ├── 📄 server.js             # Express server entry
│   └── 📄 package.json          # Backend dependencies
├── 📁 supabase/                 # Supabase configuration
│   ├── 📁 functions/            # Edge Functions (9 total)
│   ├── 📁 migrations/           # Database migrations
│   └── 📄 config.toml           # Supabase project config
├── 📁 .github/                  # GitHub Actions & workflows
│   └── 📁 workflows/            # CI/CD pipelines
├── 📁 docs/                     # Documentation
└── 📄 *.md                      # Project documentation
```

### **File Naming Conventions**

```typescript
// Components: PascalCase
components/
├── UserProfile.tsx
├── TripCard.tsx
└── AuthProvider.tsx

// Utilities: camelCase
lib/
├── utils.ts
├── auth.ts
└── database.ts

// API routes: kebab-case
api/
├── user-profile.ts
├── trip-planning.ts
└── payment-service.ts

// Environment variables: SCREAMING_SNAKE_CASE
.env
├── VITE_SUPABASE_URL
├── VITE_SUPABASE_ANON_KEY
└── VERCEL_TOKEN
```

### **Code Organization Principles**

1. **Separation of Concerns:** Each module has a single responsibility
2. **Component Hierarchy:** Atomic design (atoms → molecules → organisms)
3. **API Layer:** Centralized service layer for all external communications
4. **State Management:** Zustand for global state, React Query for server state
5. **Type Safety:** Full TypeScript coverage with strict mode
6. **Testing:** Unit tests for utilities, integration tests for components

---

## 🛠️ Development Environment Setup

### **Prerequisites**

```bash
# Required software versions
Node.js: v18.0.0 or higher
npm: v8.0.0 or higher
Git: v2.30.0 or higher
```

### **Automated Setup Script**

```bash
#!/bin/bash
# setup-dev-environment.sh

echo "🚀 Setting up Maya Travel Agent development environment..."

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install

# Setup environment files
cp frontend/env.example frontend/.env.local
cp backend/env.example backend/.env

# Initialize Git hooks (optional)
npm run prepare

echo "✅ Development environment ready!"
echo "Run 'npm run dev' to start development servers"
```

### **Environment Configuration**

#### **Frontend (.env.local)**
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# AI Service Configuration
VITE_AI_API_URL=https://api.your-ai-service.com
VITE_AI_API_KEY=your-ai-key

# Payment Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-key

# Web3 Configuration
VITE_WALLETCONNECT_PROJECT_ID=your-project-id

# Analytics
VITE_VERCEL_ANALYTICS=true
```

#### **Backend (.env)**
```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# AI Services
AI_API_KEY=your-ai-key
AI_MODEL=gpt-4

# Payment Services
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-secret

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-bot-token

# WhatsApp
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-id
```

### **Development Commands**

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",
    "test": "npm run test:frontend && npm run test:backend",
    "test:frontend": "cd frontend && npm run test",
    "test:backend": "cd backend && npm run test",
    "lint": "npm run lint:frontend && npm run lint:backend",
    "lint:frontend": "cd frontend && npm run lint",
    "lint:backend": "cd backend && npm run lint",
    "format": "npm run format:frontend && npm run format:backend",
    "format:frontend": "cd frontend && npm run format",
    "format:backend": "cd backend && npm run format"
  }
}
```

---

## 🔄 Version Control & Collaboration

### **Git Branching Strategy**

```
main (production)     ← Protected branch
├── develop           ← Development integration
│   ├── feature/auth-web3
│   ├── feature/ai-chat
│   ├── feature/payment-integration
│   └── bugfix/mobile-responsive
└── hotfix/security-patch
```

### **Branch Naming Convention**

```bash
# Features
git checkout -b feature/description-of-feature

# Bug fixes
git checkout -b bugfix/description-of-bug

# Hot fixes (emergency)
git checkout -b hotfix/description-of-fix

# Releases
git checkout -b release/v1.2.0
```

### **Commit Message Convention**

```bash
# Format: type(scope): description

# Types:
# feat: New feature
# fix: Bug fix
# docs: Documentation
# style: Code style changes
# refactor: Code refactoring
# test: Testing
# chore: Maintenance

# Examples:
git commit -m "feat(auth): add Web3 wallet authentication"
git commit -m "fix(payment): resolve Stripe webhook timeout"
git commit -m "docs(api): update payment endpoint documentation"
```

### **Pull Request Template**

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
<!-- Add screenshots of UI changes -->

## Checklist
- [ ] Code follows project conventions
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Security review completed
```

### **GitHub Actions Workflows**

#### **CI/CD Pipeline (.github/workflows/ci.yml)**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: |
        npm ci
        cd frontend && npm ci
        cd ../backend && npm ci

    - name: Type check
      run: cd frontend && npm run type-check

    - name: Lint
      run: cd frontend && npm run lint

    - name: Test
      run: cd frontend && npm run test:coverage

    - name: Build
      run: |
        cd frontend && npm run build
        cd ../backend && npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        working-directory: ./frontend
```

---

## 🔐 Authentication & Data Management

### **Supabase Integration Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase      │    │   Database      │
│   (React)       │◄──►│   Auth & API    │◄──►│   PostgreSQL    │
│                 │    │   Edge Functions│    │   RLS Enabled   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web3 Auth     │    │   Real-time     │    │   Migrations    │
│   (MetaMask)    │    │   Subscriptions  │    │   & Seeds      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Authentication Flow**

```typescript
// Authentication service (lib/auth.ts)
export class AuthService {
  // Email/Password authentication
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  }

  // Web3 authentication
  async signInWithWeb3(provider: Web3Provider) {
    // Implementation for MetaMask, WalletConnect, etc.
  }

  // Magic link authentication
  async signInWithMagicLink(email: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
    });
    return { data, error };
  }
}
```

### **Database Schema Design**

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  web3_address TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trips table
CREATE TABLE trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  budget DECIMAL(10,2),
  status TEXT DEFAULT 'planning',
  destinations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Row Level Security (RLS) Policies**

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trips policies
CREATE POLICY "Users can view own trips" ON trips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own trips" ON trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips" ON trips
  FOR UPDATE USING (auth.uid() = user_id);
```

### **Real-time Subscriptions**

```typescript
// Real-time trip updates
export const useTripSubscription = (tripId: string) => {
  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => fetchTrip(tripId),
    onSuccess: (data) => {
      // Subscribe to real-time changes
      const channel = supabase
        .channel(`trip-${tripId}`)
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'trips',
            filter: `id=eq.${tripId}`
          },
          (payload) => {
            // Handle real-time updates
            queryClient.invalidateQueries(['trip', tripId]);
          }
        )
        .subscribe();

      return () => channel.unsubscribe();
    }
  });
};
```

---

## 🚀 Deployment Pipeline

### **Vercel Deployment Architecture**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   GitHub    │───►│   Vercel    │───►│ Production │
│   Push/PR   │    │   Build     │    │   (CDN)    │
└─────────────┘    └─────────────┘    └─────────────┘
       ▲                   │                │
       │                   ▼                ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Preview    │    │   Staging   │    │   Analytics │
│ Deployment  │    │ Environment │    │   & Logs   │
└─────────────┘    └─────────────┘    └─────────────┘
```

### **Vercel Configuration (vercel.json)**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install --legacy-peer-deps",
  "devCommand": "npm run dev",
  "functions": {
    "src/pages/api/*.ts": {
      "runtime": "@vercel/node"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

### **Environment Variables Setup**

```bash
# Add environment variables to Vercel
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
vercel env add VITE_WALLETCONNECT_PROJECT_ID

# For production deployment
vercel --prod --yes
```

### **Supabase Edge Functions Deployment**

```bash
# Deploy all edge functions
supabase functions deploy

# Deploy specific function
supabase functions deploy trip-ai-chat

# Set function secrets
supabase secrets set OPENAI_API_KEY=your-key
supabase secrets set STRIPE_SECRET_KEY=your-key
```

### **Automated Deployment Workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: frontend
        run: npm ci

      - name: Build
        working-directory: frontend
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend

  deploy-functions:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1

      - name: Deploy Edge Functions
        run: supabase functions deploy --project-ref $SUPABASE_PROJECT_REF
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

---

## 🤖 Automation & Best Practices

### **Automated Scripts**

#### **Development Setup Script**
```bash
#!/bin/bash
# scripts/setup-dev.sh

echo "🔧 Setting up development environment..."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js required"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm required"; exit 1; }

# Install dependencies
npm run install:all

# Setup environment files
if [ ! -f "frontend/.env.local" ]; then
  cp frontend/env.example frontend/.env.local
  echo "✅ Created frontend/.env.local"
fi

if [ ! -f "backend/.env" ]; then
  cp backend/env.example backend/.env
  echo "✅ Created backend/.env"
fi

# Initialize husky for git hooks
npm run prepare

echo "🎉 Development environment ready!"
echo "Run 'npm run dev' to start development servers"
```

#### **Database Migration Script**
```bash
#!/bin/bash
# scripts/migrate-db.sh

echo "🗄️ Running database migrations..."

# Check if Supabase CLI is installed
command -v supabase >/dev/null 2>&1 || { echo "❌ Supabase CLI required"; exit 1; }

# Run migrations
supabase db push

# Seed database (optional)
if [ "$1" = "--seed" ]; then
  supabase db reset
  supabase seed
fi

echo "✅ Database migrations completed"
```

#### **Code Quality Check Script**
```bash
#!/bin/bash
# scripts/check-quality.sh

echo "🔍 Running code quality checks..."

# Type checking
cd frontend && npm run type-check
if [ $? -ne 0 ]; then
  echo "❌ Type check failed"
  exit 1
fi

# Linting
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Linting failed"
  exit 1
fi

# Formatting check
npm run format:check
if [ $? -ne 0 ]; then
  echo "❌ Code formatting issues found"
  exit 1
fi

# Tests
npm run test
if [ $? -ne 0 ]; then
  echo "❌ Tests failed"
  exit 1
fi

echo "✅ All quality checks passed"
```

### **Pre-commit Hooks**

```bash
#!/bin/bash
# .husky/pre-commit

echo "🔍 Running pre-commit checks..."

# Run quality checks
npm run check-quality

if [ $? -ne 0 ]; then
  echo "❌ Pre-commit checks failed"
  exit 1
fi

echo "✅ Pre-commit checks passed"
```

### **Package.json Automation Scripts**

```json
{
  "scripts": {
    "install:all": "npm install && cd frontend && npm install && cd ../backend && npm install",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",
    "test": "npm run test:frontend && npm run test:backend",
    "test:frontend": "cd frontend && npm run test",
    "test:backend": "cd backend && npm run test",
    "lint": "npm run lint:frontend && npm run lint:backend",
    "lint:frontend": "cd frontend && npm run lint",
    "lint:backend": "cd backend && npm run lint",
    "format": "npm run format:frontend && npm run format:backend",
    "format:frontend": "cd frontend && npm run format",
    "format:backend": "cd backend && npm run format",
    "check-quality": "npm run type-check && npm run lint && npm run format:check && npm run test",
    "setup": "./scripts/setup-dev.sh",
    "migrate": "./scripts/migrate-db.sh",
    "deploy": "./scripts/deploy.sh",
    "clean": "rm -rf node_modules frontend/node_modules backend/node_modules && npm run install:all"
  }
}
```

---

## 📊 Monitoring & Security

### **Application Monitoring**

#### **Vercel Analytics Integration**
```typescript
// lib/analytics.ts
import { inject } from '@vercel/analytics';

export const initAnalytics = () => {
  if (process.env.NODE_ENV === 'production') {
    inject();
  }
};

// Track custom events
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).va) {
    (window as any).va('event', { name: event, properties });
  }
};
```

#### **Error Tracking**
```typescript
// lib/error-tracking.ts
export const logError = (error: Error, context?: Record<string, any>) => {
  console.error('Application Error:', error);

  // Send to error tracking service (e.g., Sentry)
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(error, { contexts: { custom: context } });
  }
};

export const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <React.ErrorBoundary
      fallback={<ErrorFallback />}
      onError={(error, errorInfo) => {
        logError(error, { componentStack: errorInfo.componentStack });
      }}
    >
      {children}
    </React.ErrorBoundary>
  );
};
```

### **Security Best Practices**

#### **Environment Variables Security**
```bash
# Never commit secrets to git
echo ".env*" >> .gitignore
echo "!.env.example" >> .gitignore

# Use different secrets for different environments
# Production secrets should be different from development
```

#### **API Security**
```typescript
// middleware/security.ts
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

export const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://vercel.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
  cors({
    origin: process.env.NODE_ENV === 'production'
      ? ['https://yourdomain.com']
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  }),
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  }),
];
```

#### **Database Security**
```sql
-- Row Level Security (RLS) is enabled by default
-- Additional security policies

-- Prevent SQL injection through parameterized queries
-- Use Supabase client which handles this automatically

-- Audit logging
CREATE TABLE audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to log changes
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (table_name, operation, old_values, new_values, user_id)
  VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Attach audit trigger to sensitive tables
CREATE TRIGGER audit_trips_trigger
  AFTER INSERT OR UPDATE OR DELETE ON trips
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

### **Performance Optimization**

#### **Bundle Analysis**
```bash
# Analyze bundle size
cd frontend && npm run build
npx vite-bundle-analyzer dist/static/js/*.js

# Check for unused dependencies
npx depcheck

# Optimize images
npx imagemin assets/* --out-dir=assets/optimized
```

#### **Caching Strategy**
```typescript
// Service worker for caching
// public/sw.js
const CACHE_NAME = 'maya-travel-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/static/js/bundle.js',
        '/static/css/main.css',
        '/manifest.json'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

#### **Database Optimization**
```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX idx_expenses_category ON expenses(category);

-- Optimize RLS policies with indexes
CREATE INDEX idx_profiles_id_auth ON profiles(id, auth.uid());

-- Use database views for complex queries
CREATE VIEW trip_summary AS
SELECT
  t.id,
  t.title,
  t.budget,
  COUNT(e.id) as expense_count,
  COALESCE(SUM(e.amount), 0) as total_expenses,
  t.budget - COALESCE(SUM(e.amount), 0) as remaining_budget
FROM trips t
LEFT JOIN expenses e ON t.id = e.trip_id
GROUP BY t.id, t.title, t.budget;
```

---

## 📚 Documentation & Handover

### **Documentation Structure**

```
docs/
├── 📄 README.md              # Project overview
├── 📄 API_REFERENCE.md       # API documentation
├── 📄 DEPLOYMENT.md          # Deployment guide
├── 📄 DEVELOPMENT.md         # Development setup
├── 📄 TESTING.md            # Testing guide
├── 📄 SECURITY.md           # Security guidelines
├── 📄 TROUBLESHOOTING.md    # Common issues & solutions
└── 📄 CONTRIBUTING.md       # Contribution guidelines
```

### **API Documentation**

#### **OpenAPI Specification**
```yaml
# openapi.yaml
openapi: 3.0.3
info:
  title: Maya Travel Agent API
  version: 1.0.0
  description: AI-powered travel planning API

servers:
  - url: https://your-api-domain.com
    description: Production server

paths:
  /api/health:
    get:
      summary: Health check endpoint
      responses:
        '200':
          description: API is healthy
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: "healthy"
                  timestamp:
                    type: string
                    format: date-time

  /api/trips:
    get:
      summary: Get user trips
      security:
        - bearerAuth: []
      responses:
        '200':
          description: List of trips
          content:
            application/json:
              schema:
                type: object
                properties:
                  trips:
                    type: array
                    items:
                      $ref: '#/components/schemas/Trip'

components:
  schemas:
    Trip:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
        description:
          type: string
        budget:
          type: number
          format: decimal
        status:
          type: string
          enum: [planning, active, completed]

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

### **Developer Onboarding Guide**

```markdown
# 🏁 Developer Onboarding Guide

## Welcome to Maya Travel Agent! 🎉

This guide will help you get started with the project quickly.

## Prerequisites

- Node.js 18+
- npm 8+
- Git
- Supabase account
- Vercel account (for deployment)

## Quick Start

1. **Clone and setup**
   ```bash
   git clone https://github.com/your-org/maya-travel-agent.git
   cd maya-travel-agent
   npm run setup
   ```

2. **Configure environment**
   ```bash
   # Copy environment files
   cp frontend/env.example frontend/.env.local
   cp backend/env.example backend/.env

   # Fill in your API keys and configuration
   ```

3. **Start development**
   ```bash
   npm run dev
   ```

4. **Run tests**
   ```bash
   npm run test
   ```

## Project Structure Overview

- `frontend/`: React application with TypeScript
- `backend/`: Node.js API server
- `supabase/`: Database migrations and edge functions
- `docs/`: Documentation

## Key Technologies

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, Supabase
- **Database**: PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth + Web3
- **Deployment**: Vercel + Supabase

## Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `npm run test`
4. Run linting: `npm run lint`
5. Commit with conventional format: `git commit -m "feat: add new feature"`
6. Push and create PR

## Getting Help

- 📖 **Documentation**: Check `docs/` folder
- 🐛 **Issues**: Use GitHub Issues
- 💬 **Discussions**: Use GitHub Discussions
- 👥 **Team**: Reach out to team members

## Code Standards

- Use TypeScript for type safety
- Follow ESLint configuration
- Write tests for new features
- Use conventional commits
- Keep PRs small and focused

Happy coding! 🚀
```

---

## 🔧 Troubleshooting Guide

### **Common Issues & Solutions**

#### **1. Build Failures**

**Issue:** `npm run build` fails with dependency errors
```bash
# Solution: Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Issue:** TypeScript compilation errors
```bash
# Solution: Check types and fix
cd frontend && npm run type-check
# Fix any type errors shown
```

#### **2. Authentication Issues**

**Issue:** Users can't sign up/login
```bash
# Check Supabase configuration
# 1. Verify URL and keys in .env
# 2. Check Supabase dashboard for auth settings
# 3. Verify redirect URLs are configured
```

**Issue:** Web3 authentication not working
```bash
# Check WalletConnect configuration
# 1. Verify project ID in environment
# 2. Check MetaMask connection
# 3. Verify network configuration
```

#### **3. Database Issues**

**Issue:** RLS policies blocking queries
```sql
-- Check current user permissions
SELECT auth.uid();

-- Temporarily disable RLS for debugging
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;

-- Re-enable after fixing
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
```

**Issue:** Migration failures
```bash
# Reset database (CAUTION: destroys data)
supabase db reset

# Run migrations again
supabase db push
```

#### **4. Deployment Issues**

**Issue:** Vercel deployment fails
```bash
# Check build logs in Vercel dashboard
# Common issues:
# - Missing environment variables
# - Build command failures
# - Node version mismatch
```

**Issue:** Supabase functions not deploying
```bash
# Check function logs
supabase functions logs your-function-name

# Redeploy specific function
supabase functions deploy your-function-name
```

#### **5. Performance Issues**

**Issue:** Slow page loads
```bash
# Check bundle size
npm run build && du -sh dist/

# Analyze with Lighthouse
npx lighthouse http://localhost:3000

# Check for unused dependencies
npx depcheck
```

**Issue:** Database queries slow
```sql
-- Check query execution plan
EXPLAIN ANALYZE SELECT * FROM your_table WHERE condition;

-- Add missing indexes
CREATE INDEX idx_column ON table_name(column_name);
```

### **Debugging Tools**

#### **Frontend Debugging**
```typescript
// Debug logging utility
export const debug = {
  log: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 ${message}`, data);
    }
  },
  error: (message: string, error?: any) => {
    console.error(`❌ ${message}`, error);
  },
  warn: (message: string, data?: any) => {
    console.warn(`⚠️ ${message}`, data);
  }
};
```

#### **API Debugging**
```typescript
// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });

  next();
};
```

#### **Database Debugging**
```sql
-- Enable query logging
SET log_statement = 'all';

-- Check active connections
SELECT * FROM pg_stat_activity;

-- Monitor slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### **Emergency Procedures**

#### **Rollback Deployment**
```bash
# Vercel rollback
vercel rollback

# Git rollback (if needed)
git reset --hard HEAD~1
git push --force
```

#### **Database Recovery**
```bash
# Create backup
supabase db dump > backup.sql

# Restore from backup
supabase db reset
psql -f backup.sql
```

#### **Service Restart**
```bash
# Restart Vercel deployment
vercel redeploy

# Restart Supabase functions
supabase functions deploy --force
```

---

## 📞 Support & Maintenance

### **Team Communication**

- **Daily Standups**: 9:00 AM UTC (Google Meet)
- **Sprint Planning**: Every Monday (Jira)
- **Code Reviews**: Via GitHub PRs
- **Incident Response**: Slack #incidents channel

### **Maintenance Schedule**

- **Database Backups**: Daily at 2:00 AM UTC
- **Security Updates**: Weekly on Wednesdays
- **Performance Monitoring**: Continuous
- **Dependency Updates**: Monthly

### **Contact Information**

- **Technical Lead**: [Name] - [Email]
- **DevOps**: [Name] - [Email]
- **Security**: [Name] - [Email]
- **Product**: [Name] - [Email]

### **External Resources**

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **React Docs**: https://react.dev
- **TypeScript Docs**: https://typescriptlang.org

---

**🎉 This workflow guide ensures Maya Travel Agent remains maintainable, scalable, and easy to deploy. Follow these guidelines to keep the project organized and professional.**

**Last Updated:** October 9, 2025
**Version:** 1.0.0