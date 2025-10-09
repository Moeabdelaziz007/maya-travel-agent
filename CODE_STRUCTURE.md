# 🏗️ Code Structure & Architecture Guide

## Table of Contents
- [Project Overview](#project-overview)
- [Directory Structure](#directory-structure)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Key Design Patterns](#key-design-patterns)
- [Data Flow](#data-flow)
- [Module Dependencies](#module-dependencies)

---

## Project Overview

Maya Travel Agent is a **monorepo** project using **npm workspaces** to manage both frontend and backend in a single repository.

### Technology Stack

**Frontend**:
- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS (Styling)
- Zustand (State management)
- React Router (Navigation)
- Supabase Client (Database)

**Backend**:
- Node.js + Express
- Supabase (Database)
- Z.ai GLM-4.6 (AI)
- Stripe (Payments)
- Telegram Bot API
- WhatsApp Business API

---

## Directory Structure

```
maya-travel-agent/
├── frontend/                    # React application
│   ├── src/
│   │   ├── api/                # API client services
│   │   │   ├── client.ts       # Base API client
│   │   │   ├── config.ts       # API configuration
│   │   │   ├── services.ts     # API service methods
│   │   │   ├── telegram.ts     # Telegram API
│   │   │   └── paymentService.ts # Payment API
│   │   ├── components/         # React components
│   │   │   ├── Auth/          # Authentication components
│   │   │   │   ├── AuthProvider.tsx    # Auth context
│   │   │   │   ├── LoginForm.tsx       # Login form
│   │   │   │   └── SignupForm.tsx      # Signup form
│   │   │   ├── AIAssistant.tsx         # AI chat interface
│   │   │   ├── TripPlanner.tsx         # Trip planning
│   │   │   ├── Destinations.tsx        # Destinations browser
│   │   │   ├── BudgetTracker.tsx       # Budget management
│   │   │   ├── TripHistory.tsx         # Trip history
│   │   │   ├── PaymentModal.tsx        # Payment modal
│   │   │   └── ErrorBoundary.tsx       # Error handling
│   │   ├── pages/              # Page components
│   │   │   ├── AuthCallback.tsx        # OAuth callback
│   │   │   └── PaymentSuccess.tsx      # Payment success
│   │   ├── lib/                # Utility libraries
│   │   │   └── supabase.ts    # Supabase client
│   │   ├── types/              # TypeScript types
│   │   │   └── index.ts       # Type definitions
│   │   ├── test/               # Test utilities
│   │   ├── App.tsx             # Main app component
│   │   ├── main.tsx            # Entry point
│   │   ├── telegram-webapp.ts  # Telegram WebApp SDK
│   │   └── index.css           # Global styles
│   ├── tests/                  # E2E tests
│   ├── public/                 # Static assets
│   ├── index.html              # HTML template
│   ├── vite.config.ts          # Vite configuration
│   ├── tsconfig.json           # TypeScript config
│   ├── tailwind.config.js      # Tailwind config
│   └── package.json            # Frontend dependencies
│
├── backend/                     # Node.js server
│   ├── src/
│   │   ├── ai/                 # AI integration
│   │   │   ├── zaiClient.js   # Z.ai API client
│   │   │   ├── geminiClient.js # Gemini API client
│   │   │   ├── tools.js       # AI tools
│   │   │   ├── mcpTools.js    # MCP tools
│   │   │   ├── culture.js     # Cultural prompts
│   │   │   ├── mayaPersona.js # Maya personality
│   │   │   └── userProfiling.js # User profiling
│   │   └── whatsapp/           # WhatsApp integration
│   │       └── whatsappClient.js # WhatsApp API client
│   ├── routes/                 # API routes
│   │   ├── ai.js              # AI endpoints
│   │   ├── payment.js         # Payment endpoints
│   │   ├── miniapp.js         # Telegram Mini App
│   │   ├── whatsapp.js        # WhatsApp webhooks
│   │   └── stripe-webhook.js  # Stripe webhooks
│   ├── middleware/             # Express middleware
│   │   └── rateLimiter.js     # Rate limiting
│   ├── database/               # Database clients
│   │   └── supabase.js        # Supabase client
│   ├── utils/                  # Utility functions
│   ├── logs/                   # Log files
│   ├── server.js               # Main server
│   ├── telegram-bot.js         # Telegram bot (with AI)
│   ├── telegram-bot-no-ai.js   # Telegram bot (no AI)
│   ├── telegram-bot-gemini.js  # Telegram bot (Gemini)
│   ├── advanced-telegram-bot.js # Advanced bot
│   ├── test-rate-limits.js     # Rate limit tests
│   ├── ecosystem.config.js     # PM2 config
│   ├── openapi.json            # OpenAPI spec
│   └── package.json            # Backend dependencies
│
├── .devcontainer/              # Dev container config
├── .github/                    # GitHub workflows
│   └── workflows/
│       ├── ci.yml             # CI pipeline
│       └── code-review.yml    # Code review
├── docs/                       # Documentation
├── scripts/                    # Utility scripts
│   ├── setup-dev.sh           # Dev setup
│   ├── deploy.sh              # Deployment
│   ├── migrate-db.sh          # DB migration
│   └── check-quality.sh       # Quality checks
├── API_DOCUMENTATION.md        # API docs
├── RATE_LIMITING_GUIDE.md      # Rate limiting guide
├── CONTRIBUTING.md             # Contributing guide
├── CODE_STRUCTURE.md           # This file
├── README.md                   # Project overview
├── package.json                # Root package.json
└── start-dev.sh                # Dev server script
```

---

## Backend Architecture

### Layered Architecture

```
┌─────────────────────────────────────┐
│         API Routes Layer            │
│  (Express routes, validation)       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Middleware Layer               │
│  (Auth, Rate Limiting, CORS)        │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Service Layer                  │
│  (Business logic, AI, Payment)      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Data Access Layer              │
│  (Supabase, Database queries)       │
└─────────────────────────────────────┘
```

### Key Components

#### 1. **Server (server.js)**
- Main Express application
- Route registration
- Middleware setup
- Error handling

```javascript
// Middleware stack
app.use(helmet());              // Security headers
app.use(compression());         // Response compression
app.use(cors());                // CORS handling
app.use(express.json());        // JSON parsing
app.use('/api/', generalLimiter); // Rate limiting

// Route registration
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/payment', paymentLimiter, paymentRoutes);
app.use('/api/telegram', miniappRoutes);
app.use('/api/whatsapp', webhookLimiter, whatsappRoutes);
```

#### 2. **Rate Limiter (middleware/rateLimiter.js)**
- Multiple rate limiters for different endpoints
- IP-based limiting
- Configurable windows and limits

```javascript
// Different limiters for different use cases
generalLimiter    // 100 req/15min - General API
aiLimiter         // 10 req/min - AI endpoints
multimodalLimiter // 20 req/hour - Image/video analysis
paymentLimiter    // 20 req/hour - Payment endpoints
webhookLimiter    // 30 req/min - Webhooks
analyticsLimiter  // 50 req/min - Analytics
authLimiter       // 5 req/15min - Authentication
```

#### 3. **AI Integration (src/ai/)**

**zaiClient.js** - Z.ai API client
```javascript
class ZaiClient {
  async chatCompletion(messages, options)
  async generateTravelRecommendations(destination, budget, duration, preferences)
  async generateBudgetAnalysis(tripData, totalBudget)
  async generateDestinationInsights(destination, travelType)
  async analyzeMedia({ prompt, imageUrls, videoUrl }, options)
  async healthCheck()
}
```

**tools.js** - AI tools for function calling
```javascript
const Tools = {
  getWeather: async ({ location }) => { /* ... */ },
  searchFlights: async ({ from, to, date }) => { /* ... */ },
  findHotels: async ({ location, checkIn, checkOut }) => { /* ... */ },
  getHalalRestaurants: async ({ location }) => { /* ... */ },
  getPrayerTimes: async ({ location, date }) => { /* ... */ }
};
```

**culture.js** - Cultural context for AI
```javascript
function buildCulturalSystemPrompt(region) {
  // Returns culturally appropriate system prompts
  // Supports Arabic and English
}
```

#### 4. **Payment Service (routes/payment.js)**

```javascript
class PaymentService {
  static async createStripePayment(amount, currency, description)
  static async createPayPalPayment(amount, currency, description)
  static async createTelegramPayment(amount, currency, description, chatId)
}
```

#### 5. **Telegram Integration**

**telegram-bot.js** - Full-featured bot with AI
- AI-powered responses
- Conversation management
- User profiling
- Payment integration

**telegram-bot-no-ai.js** - Lightweight bot without AI
- Predefined responses
- Basic commands
- No AI dependency

**routes/miniapp.js** - Telegram Mini App API
- WebApp authentication
- Message sending
- Payment links
- Trip sharing

#### 6. **Database (database/supabase.js)**

```javascript
class SupabaseDB {
  // User management
  async getUserProfile(telegramId)
  async createUserProfile(telegramId, userData)
  async updateUserProfile(telegramId, updates)
  
  // Conversations
  async saveConversationMessage(telegramId, message, isUser)
  async getConversationHistory(telegramId, limit)
  
  // Travel offers
  async getTravelOffers(filters)
  async getPersonalizedOffers(telegramId)
  async createTravelOffer(offerData)
  
  // Analytics
  async trackOfferInteraction(telegramId, offerId, interactionType)
  async getUserAnalytics(telegramId)
}
```

---

## Frontend Architecture

### Component Hierarchy

```
App
├── AuthProvider (Context)
│   ├── LoginForm
│   └── SignupForm
├── TripPlanner
│   ├── PaymentModal
│   └── PaymentLinkModal
├── Destinations
├── BudgetTracker
├── TripHistory
├── AIAssistant
└── ErrorBoundary
```

### State Management

**Zustand Store** (if implemented):
```typescript
interface AppState {
  user: User | null;
  trips: Trip[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User) => void;
  addTrip: (trip: Trip) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
}
```

**Context API** (Auth):
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
```

### API Client (api/client.ts)

```typescript
class APIClient {
  private baseURL: string;
  private headers: Record<string, string>;
  
  async get<T>(endpoint: string): Promise<T>
  async post<T>(endpoint: string, data: any): Promise<T>
  async put<T>(endpoint: string, data: any): Promise<T>
  async delete<T>(endpoint: string): Promise<T>
  
  // Rate limit handling
  private handleRateLimit(response: Response): void
  
  // Error handling
  private handleError(error: any): never
}
```

### Component Patterns

#### 1. **Container/Presentational Pattern**

```typescript
// Container (logic)
const TripPlannerContainer: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  
  const handleCreateTrip = async (data: TripData) => {
    // Business logic
  };
  
  return <TripPlannerView trips={trips} onCreateTrip={handleCreateTrip} />;
};

// Presentational (UI)
const TripPlannerView: React.FC<Props> = ({ trips, onCreateTrip }) => {
  return (
    <div>
      {/* UI only */}
    </div>
  );
};
```

#### 2. **Custom Hooks Pattern**

```typescript
// useAuth hook
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// useAPI hook
function useAPI<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Fetch data
  }, [endpoint]);
  
  return { data, loading, error };
}
```

#### 3. **Error Boundary Pattern**

```typescript
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

---

## Key Design Patterns

### 1. **Singleton Pattern** (Database Client)

```javascript
// Only one instance of Supabase client
class SupabaseDB {
  constructor() {
    if (!this.supabase) {
      this.supabase = createClient(url, key);
    }
  }
}

module.exports = SupabaseDB;
```

### 2. **Factory Pattern** (Rate Limiters)

```javascript
function createCustomLimiter(options) {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    ...options
  });
}
```

### 3. **Strategy Pattern** (Payment Methods)

```javascript
class PaymentService {
  static async createPayment(amount, method, ...args) {
    switch (method) {
      case 'stripe':
        return await this.createStripePayment(amount, ...args);
      case 'paypal':
        return await this.createPayPalPayment(amount, ...args);
      case 'telegram':
        return await this.createTelegramPayment(amount, ...args);
      default:
        throw new Error('Invalid payment method');
    }
  }
}
```

### 4. **Repository Pattern** (Data Access)

```javascript
class SupabaseDB {
  // Abstracts database operations
  async getUserProfile(id) {
    // Database query logic
  }
  
  async saveUserProfile(data) {
    // Database insert logic
  }
}
```

### 5. **Middleware Pattern** (Express)

```javascript
// Chain of responsibility
app.use(helmet());           // Security
app.use(compression());      // Compression
app.use(cors());             // CORS
app.use(rateLimiter);        // Rate limiting
app.use('/api/ai', aiRoutes); // Routes
app.use(errorHandler);       // Error handling
```

---

## Data Flow

### 1. **User Authentication Flow**

```
User → Frontend (LoginForm)
  ↓
  POST /api/telegram/auth/telegram
  ↓
Backend (miniapp.js)
  ↓
Verify Telegram initData
  ↓
Supabase (upsert profile)
  ↓
Generate JWT token
  ↓
Return token + profile
  ↓
Frontend stores token
  ↓
User authenticated
```

### 2. **AI Chat Flow**

```
User types message
  ↓
Frontend (AIAssistant)
  ↓
POST /api/ai/chat
  ↓
Rate Limiter (10 req/min)
  ↓
Backend (routes/ai.js)
  ↓
ZaiClient.chatCompletion()
  ↓
Z.ai API (GLM-4.6)
  ↓
AI response
  ↓
Save to Supabase (optional)
  ↓
Return to frontend
  ↓
Display in chat
```

### 3. **Payment Flow**

```
User clicks "Pay"
  ↓
Frontend (PaymentModal)
  ↓
POST /api/payment/create-payment-link
  ↓
Rate Limiter (20 req/hour)
  ↓
Backend (routes/payment.js)
  ↓
Stripe API
  ↓
Create payment link
  ↓
Return payment URL
  ↓
Frontend opens Stripe checkout
  ↓
User completes payment
  ↓
Stripe webhook
  ↓
POST /api/payment/webhook
  ↓
Verify signature
  ↓
Update database
  ↓
Send confirmation
```

### 4. **Telegram Bot Flow**

```
User sends message to bot
  ↓
Telegram servers
  ↓
Webhook → Backend (telegram-bot.js)
  ↓
Parse message
  ↓
Check command or text
  ↓
If AI enabled:
  ↓
  ZaiClient.chatCompletion()
  ↓
  Get AI response
Else:
  ↓
  Predefined response
  ↓
Save to Supabase
  ↓
Send reply to user
  ↓
Telegram delivers message
```

---

## Module Dependencies

### Backend Dependencies

```
server.js
├── express
├── cors
├── helmet
├── compression
├── middleware/rateLimiter
├── routes/ai
│   ├── src/ai/zaiClient
│   ├── src/ai/tools
│   └── src/ai/culture
├── routes/payment
│   └── stripe
├── routes/miniapp
│   ├── @supabase/supabase-js
│   └── jsonwebtoken
├── routes/whatsapp
│   └── src/whatsapp/whatsappClient
└── database/supabase
```

### Frontend Dependencies

```
App.tsx
├── react
├── react-router-dom
├── components/Auth/AuthProvider
│   └── lib/supabase
├── components/TripPlanner
│   ├── api/services
│   └── components/PaymentModal
│       └── api/paymentService
├── components/AIAssistant
│   └── api/services
├── components/Destinations
│   └── api/services
└── telegram-webapp
    └── @twa-dev/sdk
```

---

## Best Practices

### 1. **Error Handling**

```javascript
// Backend
try {
  const result = await someOperation();
  res.json({ success: true, data: result });
} catch (error) {
  console.error('Operation failed:', error);
  res.status(500).json({
    success: false,
    error: 'Operation failed',
    message: error.message
  });
}

// Frontend
try {
  const data = await api.fetchData();
  setData(data);
} catch (error) {
  if (error.response?.status === 429) {
    // Handle rate limit
  } else {
    // Handle other errors
  }
}
```

### 2. **Type Safety**

```typescript
// Define types
interface Trip {
  id: string;
  destination: string;
  budget: number;
}

// Use types
function createTrip(data: Trip): Promise<Trip> {
  // TypeScript ensures type safety
}
```

### 3. **Code Organization**

- **One responsibility per file**
- **Group related functionality**
- **Clear naming conventions**
- **Consistent file structure**

### 4. **Documentation**

- **JSDoc for functions**
- **README for modules**
- **Inline comments for complex logic**
- **API documentation for endpoints**

---

## Performance Considerations

### 1. **Backend**
- Rate limiting prevents abuse
- Compression reduces bandwidth
- Caching for repeated queries
- Connection pooling for database

### 2. **Frontend**
- Code splitting with React.lazy()
- Memoization with React.memo()
- Debouncing for search inputs
- Image optimization

### 3. **Database**
- Indexed queries
- Pagination for large datasets
- Efficient query design
- Connection management

---

## Security Measures

### 1. **Backend**
- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation
- JWT authentication
- Webhook signature verification

### 2. **Frontend**
- XSS prevention
- CSRF protection
- Secure token storage
- Input sanitization
- HTTPS only

---

## Testing Strategy

### 1. **Unit Tests**
- Individual functions
- Component logic
- Utility functions

### 2. **Integration Tests**
- API endpoints
- Database operations
- Service interactions

### 3. **E2E Tests**
- User workflows
- Critical paths
- Payment flows

---

**Last Updated**: 2024-10-09  
**Version**: 1.0.0  
**Maintained by**: Maya Trips Team
