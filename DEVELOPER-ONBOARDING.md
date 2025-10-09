# 🚀 Maya Travel Agent - Developer Onboarding Guide

**Version:** 1.0.0
**Last Updated:** October 9, 2025
**Status:** Production Ready

---

## 🎯 Welcome to Maya Travel Agent!

Congratulations on joining the Maya Travel Agent team! This guide will help you get up and running quickly with our AI-powered travel assistant platform.

### **What We Build**
Maya Travel Agent is an intelligent travel planning platform that combines AI-powered recommendations with modern web technologies to create seamless travel experiences.

**Tech Stack Overview:**
- **Frontend:** React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express + Supabase Edge Functions
- **Database:** Supabase PostgreSQL with Row Level Security
- **Authentication:** Supabase Auth + Web3 Wallets (MetaMask, WalletConnect)
- **AI Integration:** Custom AI service integration
- **Payments:** Stripe integration
- **Deployment:** Vercel (Frontend) + Supabase (Backend)
- **Mobile:** Telegram Mini App + WhatsApp integration

---

## 📋 Prerequisites

Before you start, ensure you have the following installed:

### **Required Software**
- **Node.js:** v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm:** v8.0.0 or higher (comes with Node.js)
- **Git:** v2.30.0 or higher ([Download](https://git-scm.com/))
- **GitHub Account:** For code access and collaboration

### **Recommended Tools**
- **VS Code:** ([Download](https://code.visualstudio.com/))
- **GitHub Desktop:** ([Download](https://desktop.github.com/))

### **Optional but Helpful**
- **Docker:** For containerized development
- **Postman:** For API testing
- **MongoDB Compass:** For database visualization (if using MongoDB)

---

## 🚀 Quick Start Guide

### **Step 1: Clone the Repository**

```bash
# Clone the repository
git clone https://github.com/your-organization/maya-travel-agent.git
cd maya-travel-agent

# Verify you're in the right place
pwd  # Should show: /path/to/maya-travel-agent
ls   # Should show: frontend/, backend/, supabase/, etc.
```

### **Step 2: Automated Setup (Recommended)**

```bash
# Run the automated setup script
npm run setup

# This will:
# ✅ Check prerequisites (Node.js, npm, Git)
# ✅ Install all dependencies
# ✅ Create environment files
# ✅ Setup Git hooks
# ✅ Verify installation
# ✅ Create development shortcuts
```

**Manual Setup (if needed):**
```bash
# Install dependencies manually
npm run install:all

# Create environment files
cp frontend/env.example frontend/.env.local
cp backend/env.example backend/.env
```

### **Step 3: Configure Environment Variables**

#### **Frontend Configuration** (`frontend/.env.local`)
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

# Analytics (Optional)
VITE_VERCEL_ANALYTICS=true
```

#### **Backend Configuration** (`backend/.env`)
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

# Telegram Bot (Optional)
TELEGRAM_BOT_TOKEN=your-bot-token

# WhatsApp (Optional)
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-id
```

### **Step 4: Start Development Servers**

```bash
# Option 1: Use the quick start script
./start-dev.sh

# Option 2: Use npm scripts
npm run dev

# Option 3: Start individually
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend API on http://localhost:5000
```

### **Step 5: Verify Everything Works**

```bash
# Check if servers are running
curl http://localhost:3000     # Should return HTML
curl http://localhost:5000/api/health  # Should return {"status": "healthy"}

# Run tests
cd frontend && npm run test

# Check code quality
npm run check-quality
```

---

## 🏗️ Project Structure Deep Dive

### **Root Directory Overview**
```
maya-travel-agent/
├── 📁 frontend/           # React SPA (Vercel deployment)
│   ├── 📁 src/
│   │   ├── 📁 components/ # Reusable UI components (45+ shadcn/ui)
│   │   ├── 📁 api/        # API service layer
│   │   ├── 📁 hooks/      # Custom React hooks
│   │   ├── 📁 lib/        # Utilities and configurations
│   │   └── 📁 pages/      # Page-level components
│   ├── 📁 public/         # Static assets
│   └── 📄 package.json    # Frontend dependencies
├── 📁 backend/            # Node.js API server
│   ├── 📁 src/
│   │   ├── 📁 routes/     # API route handlers
│   │   ├── 📁 ai/         # AI service integrations
│   │   └── 📁 whatsapp/   # WhatsApp integration
│   └── 📄 server.js       # Express server entry point
├── 📁 supabase/           # Supabase configuration
│   ├── 📁 functions/      # Edge Functions (9 total)
│   ├── 📁 migrations/     # Database migrations
│   └── 📄 config.toml     # Supabase project config
├── 📁 scripts/            # Automation scripts
│   ├── setup-dev.sh       # Development setup
│   ├── deploy.sh          # Deployment automation
│   ├── migrate-db.sh      # Database migrations
│   └── check-quality.sh   # Code quality checks
├── 📁 .github/            # GitHub workflows
│   └── 📁 workflows/      # CI/CD pipelines
└── 📄 PROJECT-WORKFLOW-GUIDE.md  # This document
```

### **Key Architecture Patterns**

#### **1. Frontend Architecture**
```
src/
├── components/           # Atomic design pattern
│   ├── ui/              # shadcn/ui components (atoms)
│   ├── Auth/            # Authentication components (molecules)
│   └── pages/           # Page components (organisms)
├── api/                 # Service layer pattern
│   ├── client.ts        # HTTP client configuration
│   ├── services.ts      # API service functions
│   └── config.ts        # API configuration
├── hooks/               # Custom hooks pattern
│   ├── useAuth.tsx      # Authentication hook
│   ├── useAIChat.tsx    # AI chat hook
│   └── useSubscription.tsx  # Subscription hook
└── lib/                 # Utility-first pattern
    ├── auth.ts          # Authentication utilities
    ├── database.ts      # Database utilities
    └── utils.ts         # General utilities
```

#### **2. Backend Architecture**
```
backend/
├── src/
│   ├── routes/          # Route-based organization
│   │   ├── ai.js        # AI-related endpoints
│   │   ├── miniapp.js   # Telegram Mini App endpoints
│   │   └── payment.js   # Payment endpoints
│   ├── ai/              # AI service abstraction
│   │   ├── culture.js   # Cultural context
│   │   ├── tools.js     # AI tools
│   │   └── zaiClient.js # AI client
│   └── whatsapp/        # WhatsApp integration
│       └── whatsappClient.js
└── server.js            # Single entry point
```

#### **3. Database Schema**
```sql
-- Core tables with relationships
profiles (users) ──┬── trips ───┬── expenses
                   │            │
                   │            └── trip_destinations
                   │
                   └── user_preferences
```

---

## 🔧 Development Workflow

### **Daily Development Process**

#### **1. Start Your Day**
```bash
# Pull latest changes
git checkout main
git pull origin main

# Start development servers
npm run dev

# Run tests to ensure nothing is broken
npm run test
```

#### **2. Create Feature Branches**
```bash
# Create a descriptive branch name
git checkout -b feature/add-user-preferences

# Or for bug fixes
git checkout -b bugfix/fix-payment-timeout

# Or for hotfixes
git checkout -b hotfix/security-patch
```

#### **3. Development Best Practices**

**Code Quality:**
```bash
# Run quality checks before committing
npm run check-quality

# Fix linting issues
npm run lint:fix

# Fix formatting issues
npm run format

# Run tests
npm run test
```

**Git Workflow:**
```bash
# Stage your changes
git add .

# Commit with conventional format
git commit -m "feat: add user preferences functionality"

# Push your branch
git push origin feature/add-user-preferences
```

**Pull Request Process:**
1. Create PR from your feature branch to `main`
2. Fill out PR template with:
   - Description of changes
   - Testing completed
   - Screenshots (if UI changes)
   - Checklist items
3. Request review from team members
4. Address review feedback
5. Merge when approved

### **Code Standards**

#### **TypeScript Guidelines**
```typescript
// ✅ Good: Proper typing
interface UserProfile {
  id: string;
  email: string;
  preferences: Record<string, any>;
  createdAt: Date;
}

// ❌ Avoid: Any types
// const user: any = {};

// ✅ Good: Proper error handling
async function fetchUser(id: string): Promise<UserProfile> {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}
```

#### **React Component Guidelines**
```typescript
// ✅ Good: Proper component structure
interface TripCardProps {
  trip: Trip;
  onEdit?: (trip: Trip) => void;
  onDelete?: (tripId: string) => void;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  onEdit,
  onDelete
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{trip.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{trip.description}</p>
        <div className="flex gap-2 mt-4">
          {onEdit && (
            <Button onClick={() => onEdit(trip)}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" onClick={() => onDelete(trip.id)}>
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
```

#### **API Guidelines**
```typescript
// ✅ Good: Proper API service structure
export class TripService {
  static async getTrips(userId: string): Promise<Trip[]> {
    const response = await api.get(`/trips?userId=${userId}`);
    return response.data;
  }

  static async createTrip(tripData: CreateTripRequest): Promise<Trip> {
    const response = await api.post('/trips', tripData);
    return response.data;
  }

  static async updateTrip(tripId: string, updates: UpdateTripRequest): Promise<Trip> {
    const response = await api.put(`/trips/${tripId}`, updates);
    return response.data;
  }

  static async deleteTrip(tripId: string): Promise<void> {
    await api.delete(`/trips/${tripId}`);
  }
}
```

---

## 🧪 Testing Strategy

### **Testing Levels**

#### **1. Unit Tests**
```bash
# Run unit tests
cd frontend && npm run test

# Run with coverage
cd frontend && npm run test:coverage

# Run specific test file
cd frontend && npm run test TripCard.test.tsx
```

#### **2. Integration Tests**
```bash
# Test API integrations
cd frontend && npm run test:integration

# Test database operations
cd backend && npm run test:db
```

#### **3. E2E Tests**
```bash
# Run end-to-end tests
cd frontend && npm run e2e

# Run with UI mode
cd frontend && npm run e2e:ui

# Run accessibility tests
cd frontend && npm run a11y-check
```

### **Writing Tests**

#### **Component Testing Example**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { TripCard } from './TripCard';

describe('TripCard', () => {
  const mockTrip: Trip = {
    id: '1',
    title: 'Test Trip',
    description: 'A test trip',
    budget: 1000,
    status: 'planning'
  };

  it('renders trip information correctly', () => {
    render(<TripCard trip={mockTrip} />);

    expect(screen.getByText('Test Trip')).toBeInTheDocument();
    expect(screen.getByText('A test trip')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(<TripCard trip={mockTrip} onEdit={mockOnEdit} />);

    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockTrip);
  });
});
```

#### **API Testing Example**
```typescript
import { TripService } from '../services/TripService';

describe('TripService', () => {
  beforeEach(() => {
    // Setup test environment
  });

  it('should fetch user trips successfully', async () => {
    const trips = await TripService.getTrips('user-123');

    expect(trips).toBeInstanceOf(Array);
    expect(trips.length).toBeGreaterThan(0);
  });

  it('should handle API errors gracefully', async () => {
    // Mock API failure
    jest.spyOn(api, 'get').mockRejectedValue(new Error('API Error'));

    await expect(TripService.getTrips('user-123')).rejects.toThrow('API Error');
  });
});
```

---

## 🚢 Deployment Process

### **Automated Deployment**

#### **Production Deployment**
```bash
# Deploy everything to production
npm run deploy

# Or deploy specific parts
npm run deploy:frontend    # Frontend only
npm run deploy:supabase    # Functions only
```

#### **Manual Deployment**
```bash
# Deploy frontend to Vercel
cd frontend
vercel --prod --yes

# Deploy Supabase functions
supabase functions deploy

# Run database migrations
npm run migrate
```

### **Environment Management**

#### **Development Environment**
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **Database:** Local Supabase instance

#### **Staging Environment**
- **Frontend:** https://maya-travel-staging.vercel.app
- **Backend:** Supabase Edge Functions (staging)
- **Database:** Staging Supabase instance

#### **Production Environment**
- **Frontend:** https://maya-travel.vercel.app
- **Backend:** Supabase Edge Functions (production)
- **Database:** Production Supabase instance

---

## 🔍 Debugging & Troubleshooting

### **Common Issues & Solutions**

#### **1. Build Failures**
```bash
# Clear cache and reinstall
npm run clean
npm run install:all

# Check for TypeScript errors
cd frontend && npm run type-check

# Check for linting errors
cd frontend && npm run lint
```

#### **2. Authentication Issues**
```bash
# Check Supabase configuration
# 1. Verify URL and keys in .env files
# 2. Check Supabase dashboard for auth settings
# 3. Verify redirect URLs are configured

# Test authentication locally
curl http://localhost:5000/api/auth/test
```

#### **3. Database Issues**
```bash
# Check database connection
npm run migrate:list

# Reset database (destructive)
npm run migrate:reset

# Seed with sample data
npm run migrate:seed
```

#### **4. Deployment Issues**
```bash
# Check deployment logs
# Vercel: https://vercel.com/dashboard
# Supabase: https://supabase.com/dashboard

# Test deployment locally first
npm run build
npm run test
```

### **Debugging Tools**

#### **Browser DevTools**
1. **React DevTools:** Inspect component state
2. **Network Tab:** Monitor API calls
3. **Console:** Check for errors and warnings
4. **Lighthouse:** Performance and accessibility audit

#### **API Debugging**
```bash
# Test API endpoints
curl http://localhost:5000/api/health
curl http://localhost:5000/api/trips

# Check API logs
cd backend && npm run dev  # Watch for console output
```

#### **Database Debugging**
```sql
-- Check active connections
SELECT * FROM pg_stat_activity;

-- Monitor slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## 📚 Key Documentation

### **Essential Reading**

| Document | Purpose | Location |
|----------|---------|----------|
| **Project Workflow Guide** | Complete development workflow | `PROJECT-WORKFLOW-GUIDE.md` |
| **API Reference** | API endpoint documentation | `docs/API_REFERENCE.md` |
| **Deployment Guide** | Deployment instructions | `docs/DEPLOYMENT.md` |
| **Component Library** | UI component usage | `frontend/src/components/ui/` |

### **API Documentation**

#### **Core Endpoints**
```bash
# Health Check
GET /api/health

# Authentication
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout

# Trips
GET /api/trips
POST /api/trips
PUT /api/trips/:id
DELETE /api/trips/:id

# AI Chat
POST /api/ai/chat

# Payments
POST /api/payments/create-checkout
POST /api/payments/create-subscription
```

### **Database Schema**

#### **Core Tables**
- **`profiles`:** User profiles and preferences
- **`trips`:** Travel itineraries and plans
- **`expenses`:** Trip expenses and budgeting
- **`destinations`:** Available travel destinations

---

## 🤝 Team Collaboration

### **Communication Channels**

- **Daily Standups:** 9:00 AM UTC (Google Meet)
- **Sprint Planning:** Every Monday (Jira)
- **Code Reviews:** GitHub Pull Requests
- **Emergency Issues:** Slack #incidents

### **Code Review Process**

1. **Automated Checks:** GitHub Actions run automatically
2. **Manual Review:** Request review from 1-2 team members
3. **Address Feedback:** Respond to comments and make changes
4. **Approval:** Get approval before merging
5. **Merge:** Merge to main branch

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

---

## 🎯 Next Steps & Learning Path

### **Week 1: Foundation**
- [ ] Complete this onboarding guide
- [ ] Set up development environment
- [ ] Run the application locally
- [ ] Understand project structure
- [ ] Make your first code change

### **Week 2: Core Features**
- [ ] Learn authentication system
- [ ] Understand trip planning flow
- [ ] Explore AI chat functionality
- [ ] Practice with payment integration

### **Week 3: Advanced Topics**
- [ ] Database design and migrations
- [ ] API development patterns
- [ ] Testing strategies
- [ ] Deployment processes

### **Week 4: Specialization**
- [ ] Choose focus area (Frontend/Backend/DevOps)
- [ ] Contribute to open issues
- [ ] Participate in code reviews
- [ ] Plan your first feature

---

## 🆘 Getting Help

### **Resources**
- **Documentation:** `docs/` folder and `PROJECT-WORKFLOW-GUIDE.md`
- **Issues:** GitHub Issues for bugs and features
- **Discussions:** GitHub Discussions for questions
- **Team Chat:** Slack workspace

### **Common Questions**

**Q: How do I add a new API endpoint?**
```bash
# 1. Add route in backend/src/routes/
# 2. Implement handler function
# 3. Add to server.js routes
# 4. Test with curl or Postman
# 5. Add frontend service call
```

**Q: How do I add a new UI component?**
```bash
# 1. Create component in frontend/src/components/
# 2. Use shadcn/ui components as base
# 3. Add TypeScript interfaces
# 4. Write tests
# 5. Add to page/component
```

**Q: How do I deploy changes?**
```bash
# 1. Test locally: npm run test && npm run build
# 2. Commit and push to main branch
# 3. GitHub Actions will deploy automatically
# 4. Monitor deployment in Vercel dashboard
```

---

## 🎉 Welcome to the Team!

You've completed the onboarding guide! Here's what's next:

1. **Join Team Chat:** Introduce yourself in #general
2. **Schedule 1:1:** Meet with your team lead
3. **Pick First Task:** Look for "good first issue" labels on GitHub
4. **Ask Questions:** Don't hesitate to reach out for help

**Remember:** Every expert was once a beginner. Take your time, ask questions, and enjoy building amazing travel experiences with Maya! 🚀

---

**Document Version:** 1.0.0
**Last Updated:** October 9, 2025
**Maintainer:** Development Team