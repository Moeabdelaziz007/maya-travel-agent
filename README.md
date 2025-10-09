# 🌍 Maya Travel Agent - AI-Powered Travel Assistant

> Your intelligent companion for seamless travel planning, powered by advanced AI and integrated with Telegram, WhatsApp, and payment systems.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.2.0-blue)](https://reactjs.org/)

---

## ✨ Features

### 🤖 AI-Powered Intelligence
- **Smart Recommendations** - Personalized travel suggestions based on preferences
- **Budget Analysis** - Intelligent budget planning and optimization
- **Destination Insights** - Comprehensive information about destinations
- **Multimodal Analysis** - Image and video analysis for trip planning
- **Natural Language Chat** - Conversational AI in Arabic and English

### 💳 Payment Integration
- **Stripe Integration** - Secure payment link generation
- **Multiple Methods** - Support for Stripe, PayPal, and Telegram payments
- **Webhook Handling** - Real-time payment status updates
- **Rate Limited** - Protected against payment fraud

### 📱 Messaging Platforms
- **Telegram Bot** - Full-featured bot with AI responses
- **Telegram Mini App** - WebApp integration for seamless experience
- **WhatsApp Business** - WhatsApp Business API integration
- **Real-time Notifications** - Instant updates and confirmations

### 🛡️ Security & Performance
- **Rate Limiting** - 7 different rate limiters for various endpoints
- **Security Headers** - Helmet.js for enhanced security
- **CORS Protection** - Configured CORS policies
- **Input Validation** - Comprehensive request validation
- **Error Handling** - Graceful error management

### 📊 Analytics & Monitoring
- **Event Tracking** - User behavior analytics
- **Performance Metrics** - Response time and error rate monitoring
- **Health Checks** - System health monitoring
- **Logging System** - Comprehensive logging for debugging

---

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Supabase Client** - Database integration

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Supabase** - PostgreSQL database
- **Z.ai GLM-4.6** - Advanced AI model
- **Stripe** - Payment processing
- **Telegram Bot API** - Bot integration
- **WhatsApp Business API** - Messaging integration
- **JWT** - Authentication tokens

---

## 📚 Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference
- **[Rate Limiting Guide](./RATE_LIMITING_GUIDE.md)** - Rate limiting details
- **[Architecture](./ARCHITECTURE.md)** - System architecture diagrams
- **[Code Structure](./CODE_STRUCTURE.md)** - Codebase organization
- **[Contributing](./CONTRIBUTING.md)** - Contribution guidelines

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** v9.0.0 or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Code Editor** (VS Code recommended)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/Moeabdelaziz007/maya-travel-agent.git
cd maya-travel-agent
```

#### 2. Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm run install:all
```

This will install dependencies for:
- Root workspace
- Frontend application
- Backend server

#### 3. Environment Configuration

**Backend Environment Variables**:

```bash
cd backend
cp env.example .env
```

Edit `backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Telegram Bot (Required for bot features)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Z.ai API (Required for AI features)
ZAI_API_KEY=your_zai_api_key
ZAI_API_BASE_URL=https://api.z.ai/api/paas/v4
ZAI_MODEL=glm-4.6

# Supabase (Optional - uses memory storage if not configured)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Payment Integration (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
PAYPAL_CLIENT_ID=your_paypal_client_id

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

**Frontend Environment Variables**:

```bash
cd frontend
cp env.example .env
```

Edit `frontend/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:5000

# Supabase (Optional)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 4. Start Development Servers

**Option 1: Start Both Servers** (Recommended)

```bash
# From project root
npm run dev
```

This starts:
- Frontend on `http://localhost:3000`
- Backend on `http://localhost:5000`

**Option 2: Start Individually**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### 5. Verify Installation

Open your browser and navigate to:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **API Docs**: [http://localhost:5000/api/openapi.json](http://localhost:5000/api/openapi.json)

---

## 🤖 Telegram Bot Setup

### Option 1: Bot with AI (Requires Z.ai API Key)

```bash
cd backend
node telegram-bot.js
```

**Features**:
- AI-powered responses
- Smart recommendations
- Budget analysis
- Destination insights

### Option 2: Bot without AI (Works Immediately)

```bash
cd backend
node telegram-bot-no-ai.js
```

**Features**:
- Predefined responses
- Basic commands
- No AI dependency
- Conversation management

### Bot Commands

- `/start` - Start the bot
- `/help` - Get help
- `/trip` - Plan a trip
- `/stats` - View statistics
- `/payment` - Create payment link

---

## 📱 Access the Application

### Web Application
- **URL**: [http://localhost:3000](http://localhost:3000)
- **Features**: Full web interface with all features

### Telegram Bot
- **Search**: `@maya_trips_bot` on Telegram
- **Features**: AI chat, trip planning, payments

### API Endpoints
- **Base URL**: `http://localhost:5000/api`
- **Health Check**: `/api/health`
- **AI Chat**: `/api/ai/chat`
- **Payment**: `/api/payment/create-payment-link`

---

## 🧪 Testing

### Frontend Tests

```bash
cd frontend

# Unit tests
npm run test

# E2E tests
npm run e2e

# Test coverage
npm run test:coverage

# Accessibility tests
npm run a11y-check
```

### Backend Tests

```bash
cd backend

# Rate limit tests
node test-rate-limits.js

# Bot tests
node test-bot.js

# Z.ai tests
node test-zai.js
```

### Code Quality

```bash
cd frontend

# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check

# Formatting
npm run format
npm run format:check
```

### Development Commands

#### Frontend Development
```bash
cd frontend

# Start development server
npm run dev

# Run tests
npm run test
npm run test:ui
npm run test:coverage

# Linting and formatting
npm run lint
npm run lint:fix
npm run format
npm run format:check

# Type checking
npm run type-check

# Build for production
npm run build

# E2E testing
npm run e2e
npm run e2e:ui

# Accessibility testing
npm run a11y-check
```

#### Backend Development
```bash
cd backend

# Start development server
npm run dev

# Start production server
npm run start
```

### Development Commands

```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend

# Build for production
npm run build

# Start production servers
npm run start
```

## Project Structure

```
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
├── docs/             # Documentation
└── README.md         # Project overview
```

## Testing

### Running Tests
```bash
# Unit tests
cd frontend && npm run test

# E2E tests
cd frontend && npm run e2e

# All tests with coverage
cd frontend && npm run test:coverage
```

### Test Coverage
We aim for >80% test coverage for critical components. Run `npm run test:coverage` to see current coverage.

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill processes on ports 3000 and 5000
   lsof -ti:3000 | xargs kill -9
   lsof -ti:5000 | xargs kill -9
   ```

2. **Node modules issues**
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   rm -rf frontend/node_modules frontend/package-lock.json
   rm -rf backend/node_modules backend/package-lock.json
   npm run install:all
   ```

3. **TypeScript errors**
   ```bash
   cd frontend && npm run type-check
   ```

4. **Linting errors**
   ```bash
   cd frontend && npm run lint:fix
   ```

5. **Build failures**
   ```bash
   cd frontend && npm run build
   ```

## Performance

### Bundle Analysis
```bash
cd frontend && npm run build
# Check dist/ folder for bundle sizes
```

### Lighthouse Audit
```bash
# Install lighthouse globally
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html
```

## Security

### Security Audit
```bash
npm audit
cd frontend && npm audit
cd backend && npm audit
```

### Dependency Updates
```bash
npm update
cd frontend && npm update
cd backend && npm update
```

## Contributing

This project is part of the Maya Trips ecosystem - your intelligent travel companion.

### Development Workflow
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `npm run test`
4. Run linting: `npm run lint`
5. Commit your changes: `git commit -m "Add your feature"`
6. Push to your branch: `git push origin feature/your-feature`
7. Create a Pull Request

### Code Standards
- Follow TypeScript best practices
- Write tests for new features
- Ensure accessibility compliance
- Follow the existing code style
- Update documentation as needed
