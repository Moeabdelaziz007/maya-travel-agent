# OpenMemory Guide - Maya Travel Agent

## Project Overview

**Maya Travel Agent** is an AI-powered travel assistant platform that combines modern web technologies with intelligent travel recommendations. The project features a React-based frontend, Node.js backend, and integrates with multiple services including Telegram Bot, Z.ai (GLM-4.6), Stripe payments, and Supabase database.

### Key Features
- 🧠 AI-powered travel recommendations using Z.ai GLM-4.6 model
- 🗺️ Smart trip planning with personalized suggestions
- 💰 Budget tracking and expense management
- 📱 Telegram Mini App integration for mobile experience
- 💳 Payment processing via Stripe and PayPal
- 🌍 Global destinations with halal-friendly and cultural considerations
- 📊 Advanced user profiling and behavior tracking
- 🤖 Conversational AI with Maya persona (friendly, culturally-aware Saudi travel assistant)

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS + Framer Motion (animations)
- Lucide React (icons)
- Zustand (state management)
- React Router v6
- Vitest + Playwright (testing)
- Supabase client for authentication and real-time data

**Backend:**
- Node.js with Express
- Supabase (PostgreSQL) for database
- Mongoose (optional MongoDB support, currently unused)
- Telegram Bot API
- Z.ai GLM-4.6 (Chinese AI model) for conversational AI
- Stripe + PayPal for payments
- JWT authentication
- Rate limiting and security (Helmet, CORS)

**Infrastructure:**
- Supabase for database and authentication
- Telegram Bot for messaging interface
- Stripe/PayPal for payment processing
- Environment-based configuration

## Architecture

### System Design
The project follows a **client-server architecture** with clear separation between frontend and backend:

1. **Frontend Layer** (Port 3000)
   - React SPA with TypeScript
   - Communicates with backend via REST APIs
   - Handles UI/UX, authentication flow, and Telegram WebApp integration
   - Uses Supabase client for real-time features

2. **Backend Layer** (Port 5000)
   - Express REST API server
   - Handles business logic, AI interactions, and database operations
   - Manages Telegram Bot webhook and Mini App requests
   - Processes payments via Stripe/PayPal webhooks
   - Integrates with Z.ai for AI-powered recommendations

3. **Database Layer** (Supabase PostgreSQL)
   - Enhanced schema with comprehensive user profiling
   - Tables: users, trips, destinations, conversations, user_interests, user_dislikes, expenses, payments, halal_restaurants, prayer_locations, etc.
   - Row Level Security (RLS) enabled for data protection
   - Automated triggers for user activity tracking

4. **External Services**
   - **Z.ai GLM-4.6**: Chinese AI model for conversational intelligence
   - **Telegram**: Bot API + Mini App for mobile experience
   - **Stripe/PayPal**: Payment processing
   - **Supabase**: Authentication, database, real-time subscriptions

### Technology Choices
- **Why React + TypeScript**: Type safety, modern development experience, extensive ecosystem
- **Why Vite**: Fast HMR, optimized builds, better DX than Create React App
- **Why Supabase**: Open-source Firebase alternative, PostgreSQL-based, built-in auth and real-time
- **Why Z.ai GLM-4.6**: Cost-effective Chinese AI model with good Arabic support for Saudi market
- **Why Telegram**: Popular in Middle East, built-in payment support, Mini Apps for seamless UX
- **Why Monorepo**: Frontend + Backend in one repo for easier development and deployment

## User Defined Namespaces

Define your project-specific namespaces below. The AI will use these descriptions to intelligently categorize and search memories.

- **frontend**: React components, TypeScript interfaces, UI/UX patterns, Tailwind styling, client-side state management, routing, testing
- **backend**: Express routes, API endpoints, database queries, authentication middleware, business logic, payment processing
- **ai**: Z.ai integration, Maya persona configuration, user profiling, conversation management, MCP tools, cultural adaptations
- **database**: Supabase schema, migrations, RLS policies, triggers, data modeling, query optimization
- **telegram**: Bot commands, webhook handling, Mini App integration, Telegram-specific UI components
- **payments**: Stripe integration, PayPal setup, webhook handling, transaction management, payment links
- **testing**: Vitest unit tests, Playwright e2e tests, test utilities, mocking strategies

## Components

### Frontend Components

#### `App.tsx`
- Main application component
- Handles routing and layout
- Integrates ErrorBoundary for error handling
- Provides global state via Zustand

#### `Auth/` Module
- **AuthProvider.tsx**: Context provider for authentication state
- **LoginForm.tsx**: User login with email/password
- **SignupForm.tsx**: User registration with Supabase
- Handles Supabase auth flow and session management

#### `TripPlanner.tsx`
- Core trip planning interface
- Form validation with react-hook-form
- Creates trips with destinations, dates, budget
- Integrates with backend API for trip storage

#### `AIAssistant.tsx`
- Chat interface with Maya AI
- Real-time conversation via Z.ai
- Message history display
- Voice input support (planned)

#### `BudgetTracker.tsx`
- Expense tracking and visualization
- Category-based expense management
- Budget vs. actual comparison
- Visual charts and alerts

#### `Destinations.tsx`
- Browse global destinations
- Search and filter functionality
- Rating and price range filters
- Halal-friendly indicators

#### `PaymentModal.tsx` & `PaymentLinkModal.tsx`
- Stripe payment integration
- Payment link generation
- Telegram payment support

### Backend Components

#### `/routes/ai.js`
- POST `/api/ai/chat`: Conversational AI endpoint
- Integrates with Z.ai GLM-4.6 model
- Uses Maya persona and user profiling
- Handles conversation history and context

#### `/routes/miniapp.js`
- Telegram Mini App endpoints
- Handles WebApp initialization
- User authentication via Telegram ID
- Trip and destination data for Mini App

#### `/routes/payment.js`
- Payment intent creation
- Payment link generation
- Telegram payment webhook
- Transaction tracking

#### `/routes/stripe-webhook.js`
- Stripe webhook event handling
- Payment confirmation processing
- Automatic trip/payment status updates

#### `/src/ai/` Module
- **zaiClient.js**: Z.ai API client wrapper
- **mayaPersona.js**: Maya's personality, tone, and conversation style
- **userProfiling.js**: Dynamic user preference extraction from conversations
- **culture.js**: Saudi/Arabic cultural context and adaptations
- **tools.js**: Tool definitions for AI function calling
- **mcpTools.js**: MCP (Model Context Protocol) tool integration

### Database Schema

**Enhanced schema with 20+ tables** for comprehensive user profiling:

**Core Tables:**
- `users`: Extended profile with travel preferences, cultural background, engagement metrics
- `trips`: Trip planning with AI recommendations and satisfaction tracking
- `destinations`: Global destinations with halal-friendly info, prayer locations, cultural highlights
- `expenses`: Expense tracking with categories and receipt storage
- `payments`: Payment transactions with provider tracking

**Profiling Tables:**
- `user_interests`: Learned interests from conversations (activities, destinations, cuisines)
- `user_dislikes`: Things to avoid in recommendations
- `user_goals`: Travel goals and progress tracking
- `user_constraints`: Budget, time, health, religious constraints
- `user_motivations`: Why users travel (exploration, relaxation, culture, etc.)

**AI & Tracking Tables:**
- `conversations`: Complete chat history with satisfaction scores
- `ai_recommendations`: AI suggestions with confidence scores and feedback
- `user_behavior`: Action tracking for analytics
- `user_sessions`: Session tracking across platforms (web, Telegram, mobile)

**Specialized Tables:**
- `halal_restaurants`: Halal-certified dining options
- `prayer_locations`: Mosques and prayer facilities
- `trip_activities`: Detailed activity planning within trips

## Implementation Patterns

### API Communication Pattern
- All API calls use `axios` with centralized configuration
- Base URL configured via environment variables
- Error handling with try-catch and user-friendly messages
- Request/response interceptors for auth tokens

### State Management Pattern
- **Zustand** for global state (lightweight, no boilerplate)
- Local state with `useState` for component-specific data
- React Hook Form for complex form state
- Supabase real-time subscriptions for live data updates

### Authentication Pattern
- Supabase Auth for user management
- JWT tokens stored in localStorage
- Protected routes with AuthProvider
- Automatic token refresh
- Support for email/password and OAuth providers

### Error Handling Pattern
- ErrorBoundary component at app root
- Try-catch blocks in async functions
- User-friendly error messages (no technical jargon)
- Fallback UI for error states
- Console errors for debugging

### Styling Pattern
- **Tailwind CSS** utility-first approach
- Custom Tailwind configuration for brand colors
- Framer Motion for animations and transitions
- Responsive design with mobile-first breakpoints
- Glass morphism effects for modern UI

### Testing Pattern
- **Vitest** for unit tests (React Testing Library)
- **Playwright** for e2e tests
- Test files in `__tests__` directories or `tests/e2e/`
- Mock Supabase and external APIs in tests
- Accessibility testing with `@playwright/test`

### AI Integration Pattern
- Z.ai client with retry logic and error handling
- Maya persona loaded as system prompt
- User profiling data injected into context
- Conversation history maintained for continuity
- Cultural adaptations based on user's background

### Payment Integration Pattern
- Stripe Checkout for web payments
- Telegram Payments for in-bot transactions
- Webhook verification for security
- Payment status tracking in database
- Automatic trip updates on successful payment

## Debugging History

*This section will be populated as debugging sessions occur.*

### Initial Setup Issues
- **Issue**: Frontend not connecting to backend
- **Solution**: CORS configuration in backend, updated `CORS_ORIGIN` in `.env`

## User Preferences

*This section will be populated as user preferences are discovered.*

- User prefers working in cloud-based development environments (Gitpod) for performance

## Recent Changes

- [2025-10-10 Initial]: Performed initial codebase deep dive and created OpenMemory guide
- [2025-10-10 Initial]: Documented complete project architecture, tech stack, and component structure
- [2025-10-10 Initial]: Added Gitpod workspace configuration for cloud-based development

