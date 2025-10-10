# OpenMemory Guide - Maya Travel Agent

## Project Overview

Maya Travel Agent is an AI-powered travel assistant application that provides intelligent trip planning, budget analysis, and destination recommendations. The system integrates multiple platforms (Web, Telegram, WhatsApp) and offers comprehensive travel services powered by Z.ai GLM-4.6 AI model.

### Key Features
- **AI-Powered Intelligence**: Smart recommendations, budget analysis, destination insights, multimodal analysis
- **Payment Integration**: Stripe, PayPal, and Telegram payment methods with webhook handling
- **Messaging Platforms**: Telegram Bot, Telegram Mini App, WhatsApp Business API integration
- **Security & Performance**: 7 different rate limiters, Helmet.js security headers, CORS protection
- **Analytics & Monitoring**: Event tracking, performance metrics, health checks, comprehensive logging

### Tech Stack

**Frontend (React 18 + TypeScript)**:
- Vite build tool with hot module replacement
- Tailwind CSS for styling
- Zustand for state management
- React Router for navigation
- Framer Motion for animations
- Supabase client for database operations

**Backend (Node.js + Express)**:
- Express framework with middleware architecture
- Supabase PostgreSQL database
- Z.ai GLM-4.6 AI model integration
- Stripe payment processing
- Telegram Bot API and WhatsApp Business API
- JWT authentication with Telegram WebApp verification

**Database (Supabase PostgreSQL)**:
- users, trips, expenses tables
- profiles (Telegram user data)
- messages (conversation history)
- travel_offers (personalized offers)
- destinations (travel destinations catalog)
- ai_conversations (AI chat history)

### Project Structure
- **Monorepo**: Uses npm workspaces to manage frontend and backend together
- **Frontend**: `/frontend` - React app on http://localhost:3000
- **Backend**: `/backend` - Express API on http://localhost:5000
- **Documentation**: Extensive docs including API_DOCUMENTATION.md, ARCHITECTURE.md, CODE_STRUCTURE.md

---

## Architecture

### System Layers

**Layer 1: Frontend**
- React components with TypeScript
- API client with rate limit handling
- Telegram WebApp SDK integration
- Auth provider using Context API
- Component hierarchy: App → AuthProvider → TripPlanner/Destinations/AIAssistant

**Layer 2: API Gateway (Express)**
- Security: Helmet.js, CORS, input validation
- Rate limiting: 7 different limiters for various endpoints
- Compression and optimization
- Route handlers for AI, payment, Telegram, WhatsApp

**Layer 3: Service Layer**
- ZaiClient (src/ai/zaiClient.js): AI operations, chat completion, travel recommendations, budget analysis
- PaymentService (routes/payment.js): Stripe, PayPal, Telegram payments
- SupabaseDB (database/supabase.js): Database operations, user profiles, conversations
- WhatsAppClient (src/whatsapp/whatsappClient.js): WhatsApp Business API integration

**Layer 4: External Services**
- Z.ai API (GLM-4.6 model)
- Stripe API (payment processing)
- Telegram Bot API
- WhatsApp Business API
- Supabase (PostgreSQL database)

**Layer 5: Data Layer**
- Supabase PostgreSQL with Row Level Security
- Tables: users, trips, expenses, profiles, messages, travel_offers, destinations, ai_conversations
- Real-time subscriptions for live updates

### Request Flow Patterns

**AI Chat Flow**:
1. User input → AIAssistant component (frontend)
2. POST /api/ai/chat → Rate limiter (10 req/min)
3. AI route handler (routes/ai.js) → ZaiClient.chatCompletion()
4. Z.ai API call (GLM-4.6) → AI response
5. Optional save to Supabase → Return JSON → Display in UI

**Payment Flow**:
1. User clicks "Pay" → PaymentModal component
2. POST /api/payment/create-payment-link → Rate limiter (20 req/hour)
3. Payment route handler → Stripe API
4. Create payment link → Return URL → Open Stripe checkout
5. User completes payment → Stripe webhook → POST /api/payment/webhook
6. Verify signature → Update database → Send confirmation

**Telegram Bot Flow**:
1. User message → Telegram servers → Webhook to backend
2. telegram-bot.js message handler → Parse message
3. Check if command (/start, /help) or text message
4. If AI enabled: ZaiClient.chatCompletion() → Get AI response
5. If AI disabled: Predefined response
6. Save to Supabase → Send reply → Telegram delivers

---

## User Defined Namespaces

Define your project-specific namespaces below. The AI will use these descriptions to intelligently categorize and search memories.

- **frontend**: React components, UI/UX patterns, Tailwind styling, Zustand state management, TypeScript types, API client integration
- **backend**: Express routes, middleware, service layer, business logic, error handling, logging
- **ai-integration**: Z.ai client, AI tools, MCP tools, Maya persona, user profiling, cultural context, multimodal analysis
- **payment**: Stripe integration, PayPal, Telegram payments, webhook handling, payment link generation
- **telegram**: Bot implementation, Mini App routes, WebApp authentication, conversation management, commands
- **whatsapp**: WhatsApp Business API, webhook handling, message processing
- **database**: Supabase client, schema design, queries, user profiles, conversations, travel offers
- **security**: Rate limiting, Helmet.js, CORS, JWT authentication, input validation, webhook verification
- **testing**: Unit tests (Vitest/Jest), E2E tests (Playwright), coverage reports, test utilities

---

## Components

### Frontend Components

**Core UI Components** (`/frontend/src/components/`):
- **AIAssistant.tsx**: Chat interface for AI conversations, handles message sending and display, integrates with /api/ai/chat endpoint
- **TripPlanner.tsx**: Main trip planning interface, form handling for destination/budget/dates, displays trip recommendations
- **Destinations.tsx**: Destination browser with filtering and search, displays destination cards with images and ratings
- **BudgetTracker.tsx**: Budget management and expense tracking, categorizes expenses, displays spending analytics
- **TripHistory.tsx**: Historical trips display, pagination support, trip detail views
- **PaymentModal.tsx**: Payment interface modal, Stripe checkout integration, payment method selection
- **ErrorBoundary.tsx**: React error boundary for graceful error handling, fallback UI display

**Auth Components** (`/frontend/src/components/Auth/`):
- **AuthProvider.tsx**: Authentication context provider, manages user state, Supabase auth integration
- **LoginForm.tsx**: Login form with validation, email/password authentication, Telegram WebApp auth
- **SignupForm.tsx**: Signup form with validation, user registration flow

**API Layer** (`/frontend/src/api/`):
- **client.ts**: Base API client with axios, rate limit handling, error handling, request/response interceptors
- **services.ts**: API service methods for trips, destinations, AI chat
- **paymentService.ts**: Payment-specific API methods, Stripe integration
- **telegram.ts**: Telegram Mini App API integration

### Backend Components

**AI Integration** (`/backend/src/ai/`):
- **zaiClient.js**: Z.ai API client wrapper, methods: chatCompletion, generateTravelRecommendations, generateBudgetAnalysis, generateDestinationInsights, analyzeMedia, healthCheck
- **geminiClient.js**: Google Gemini API client (alternative AI provider)
- **tools.js**: AI tools for function calling - getWeather, searchFlights, findHotels, getHalalRestaurants, getPrayerTimes
- **mcpTools.js**: Model Context Protocol tools for advanced AI capabilities
- **mayaPersona.js**: Maya personality and conversation style definitions
- **culture.js**: Cultural context system prompts, supports Arabic and English responses
- **userProfiling.js**: User preference tracking and personalization logic

**API Routes** (`/backend/routes/`):
- **ai.js**: AI endpoints - /chat, /travel-recommendations, /budget-analysis, /destination-insights, /multimodal/analyze
- **payment.js**: Payment endpoints - /create-payment-link, /create-payment, /confirm-payment
- **stripe-webhook.js**: Stripe webhook handler for payment confirmation
- **miniapp.js**: Telegram Mini App endpoints - /auth/telegram, /send-message, /payment-link, /share-trip
- **whatsapp.js**: WhatsApp webhook handler for incoming messages

**Middleware** (`/backend/middleware/`):
- **rateLimiter.js**: Rate limiting middleware with 7 different limiters:
  - generalLimiter: 100 req/15min (all API routes)
  - aiLimiter: 10 req/min (AI endpoints)
  - multimodalLimiter: 20 req/hour (image/video analysis)
  - paymentLimiter: 20 req/hour (payment endpoints)
  - webhookLimiter: 30 req/min (webhooks)
  - analyticsLimiter: 50 req/min (analytics)
  - authLimiter: 5 req/15min (authentication)

**Database** (`/backend/database/`):
- **supabase.js**: Supabase client wrapper with methods:
  - User management: getUserProfile, createUserProfile, updateUserProfile
  - Conversations: saveConversationMessage, getConversationHistory
  - Travel offers: getTravelOffers, getPersonalizedOffers, createTravelOffer
  - Analytics: trackOfferInteraction, getUserAnalytics

**Utilities** (`/backend/utils/`):
- **conversationManager.js**: Manages conversation state and context
- **errorHandler.js**: Centralized error handling and logging
- **healthMonitor.js**: System health monitoring and metrics
- **logger.js**: Winston-based logging with file and console transports

**Telegram Integration** (`/backend/`):
- **telegram-bot.js**: Full-featured bot with AI (requires Z.ai API key)
- **telegram-bot-no-ai.js**: Lightweight bot with predefined responses (no AI dependency)
- **telegram-bot-gemini.js**: Bot using Google Gemini AI
- **advanced-telegram-bot.js**: Advanced bot with MCP tools and user profiling

**WhatsApp Integration** (`/backend/src/whatsapp/`):
- **whatsappClient.js**: WhatsApp Business API client for sending messages

---

## Implementation Patterns

### Pattern 1: Layered Architecture
- **Separation of concerns**: Routes → Services → Data Access
- **Middleware chain**: Security → Rate Limiting → Routes → Error Handling
- **Service layer abstraction**: Business logic separated from route handlers

### Pattern 2: Rate Limiting Strategy
- **Multiple limiters**: Different limits for different endpoints based on resource intensity
- **IP-based limiting**: Prevents abuse from single sources
- **Configurable windows**: Flexible time windows (per minute, per hour, per 15 minutes)
- **Graceful degradation**: Returns 429 with retry-after header

### Pattern 3: AI Integration
- **Personality injection**: Maya persona applied to all AI responses
- **Cultural awareness**: buildCulturalSystemPrompt() for Arabic/English context
- **Tool calling**: Function calling for weather, flights, hotels, prayer times
- **Conversation context**: Maintains conversation history for continuity

### Pattern 4: Payment Processing
- **Multiple providers**: Strategy pattern for Stripe, PayPal, Telegram
- **Webhook verification**: Signature validation for payment confirmations
- **Error handling**: Graceful failure with detailed error messages
- **Rate limiting**: Prevents payment fraud and abuse

### Pattern 5: Error Handling
- **Try-catch blocks**: Comprehensive error catching in all async operations
- **Centralized logging**: Winston logger with file and console outputs
- **User-friendly errors**: Error messages formatted for frontend display
- **Error boundaries**: React error boundaries prevent full app crashes

### Pattern 6: Database Access
- **Repository pattern**: SupabaseDB class abstracts database operations
- **Single client instance**: Singleton pattern for Supabase client
- **Error handling**: Database errors caught and logged appropriately
- **Optional integration**: System works with in-memory fallback if Supabase not configured

### Pattern 7: API Client (Frontend)
- **Axios interceptors**: Request/response transformation and error handling
- **Rate limit handling**: Detects 429 responses and notifies user
- **Type safety**: TypeScript interfaces for all API responses
- **Retry logic**: Can retry failed requests with exponential backoff

### Pattern 8: Component Patterns (Frontend)
- **Container/Presentational**: Separation of logic and UI
- **Custom hooks**: useAuth, useAPI for reusable logic
- **Error boundaries**: Catch and display component errors
- **Context API**: Auth state management across components

### Pattern 9: Testing Strategy
- **Unit tests**: Component and function testing with Vitest/Jest
- **E2E tests**: User flow testing with Playwright
- **Coverage reports**: Generated in /coverage directories
- **Mock services**: Mock AI and database services for testing

---

## Debugging History

### Session 1: Initial Setup and Configuration (2025-10-10)
- Issue: MongoDB dependency in server.js but project uses Supabase
- Resolution: Commented out MongoDB connection, added console message confirming Supabase usage
- Files: backend/server.js (lines 39-49)

### Session 2: Rate Limiting Implementation (2025-10-09)
- Issue: Need to prevent API abuse and manage resource usage
- Resolution: Implemented 7 different rate limiters for various endpoint types
- Files: backend/middleware/rateLimiter.js, backend/server.js
- Configuration: Different limits based on resource intensity (AI: 10/min, Payment: 20/hour, etc.)

### Session 3: Telegram Bot Integration (2025-10-09)
- Issue: Multiple bot implementations causing confusion
- Resolution: Created separate bots for different use cases:
  - telegram-bot.js: Full AI integration (requires Z.ai API key)
  - telegram-bot-no-ai.js: Predefined responses (no dependencies)
  - telegram-bot-gemini.js: Google Gemini integration
  - advanced-telegram-bot.js: MCP tools and advanced features

### Session 4: Test Coverage Implementation (2025-10-09)
- Issue: Need comprehensive testing for reliability
- Resolution: Added unit tests for AI services, database, rate limits, security
- Coverage: Backend tests in /backend/tests/__tests__/, Frontend tests with Vitest and Playwright
- Files: jest.config.js, vitest.config.ts, playwright.config.ts

---

## User Preferences

### Development Workflow
- **Package manager**: npm (monorepo with workspaces)
- **Development servers**: Run both frontend and backend with `npm run dev` from root
- **Port configuration**: Frontend on 3000, Backend on 5000

### Code Style
- **Frontend**: TypeScript with strict mode, ESLint + Prettier configuration
- **Backend**: JavaScript (ES6+), CommonJS modules
- **Formatting**: Consistent indentation, descriptive variable names
- **Documentation**: JSDoc comments for complex functions

### Testing Preferences
- **Frontend**: Vitest for unit tests, Playwright for E2E tests
- **Backend**: Jest for unit tests
- **Coverage**: Aim for >80% coverage on critical components
- **Commands**: `npm run test`, `npm run test:coverage`, `npm run e2e`

### Deployment
- **CI/CD**: GitHub Actions (configuration in .github/workflows/)
- **Environments**: Development (local), Production (cloud platforms)
- **Monitoring**: Winston logging, health check endpoints

---

## Recent Changes

- [2025-10-10 12:00]: Initial codebase deep dive completed - comprehensive project analysis performed
- [2025-10-10 12:00]: Analyzed project structure, tech stack, and architecture patterns
- [2025-10-10 12:00]: Documented 40+ components across frontend and backend
- [2025-10-10 12:00]: Identified 9 key implementation patterns and design decisions
- [2025-10-10 12:00]: Catalogued testing strategy and debugging history
- [2025-10-10 12:00]: Created user-defined namespaces for memory organization (frontend, backend, ai-integration, payment, telegram, whatsapp, database, security, testing)
