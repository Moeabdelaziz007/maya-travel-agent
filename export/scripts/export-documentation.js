#!/usr/bin/env node

/**
 * Documentation Export Script
 * Generates comprehensive PDF documentation for the entire Amrikyy Travel Agent system
 */

const fs = require('fs');
const path = require('path');
const logger = require('../../backend/src/utils/logger');

class DocumentationExporter {
  constructor() {
    this.exportDir = path.join(__dirname, '..');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  /**
   * Generate system overview documentation
   */
  async generateSystemOverview() {
    try {
      logger.info('Generating system overview documentation...');

      const overview = {
        title: 'Amrikyy Travel Agent - System Overview',
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        sections: [
          {
            title: 'Executive Summary',
            content: `
# Amrikyy Travel Agent - Executive Summary

## System Overview
Amrikyy Travel Agent is a comprehensive AI-powered travel planning and booking platform that leverages machine learning, data governance, and intelligent automation to provide personalized travel recommendations and seamless booking experiences.

## Key Features
- **AI-Powered Trip Planning**: Intelligent trip recommendations based on user preferences and historical data
- **Price Prediction**: ML-powered flight and hotel price predictions for optimal booking timing
- **Personalized Experience**: Dynamic user profiling and adaptive AI conversations
- **Comprehensive Data Governance**: Enterprise-grade data management with Collibra integration
- **Real-time Analytics**: Live monitoring and performance tracking with Grafana dashboards
- **Multi-Platform Integration**: Telegram bot, web application, and API services

## Architecture Highlights
- **Backend**: Node.js microservices with AI orchestration
- **Frontend**: React-based web application with Telegram Mini App
- **Data Platform**: Supabase database with Fivetran ingestion and dbt transformations
- **ML Platform**: Dataiku DSS for model training and deployment
- **Governance**: Collibra for data governance and compliance
- **Monitoring**: Prometheus and Grafana for observability
- **Deployment**: Docker containerization with CI/CD pipelines
            `
          },
          {
            title: 'System Architecture',
            content: `
# System Architecture

## High-Level Architecture
Amrikyy Travel Agent follows a modern microservices architecture with clear separation of concerns:

### Core Components
1. **API Gateway & Load Balancer**
   - Nginx reverse proxy
   - Rate limiting and request routing
   - SSL termination and security headers

2. **Backend Services**
   - Authentication & Authorization Service
   - Trip Planning & Booking Service
   - AI Orchestration & Chat Service
   - Payment Processing Service
   - Data Integration Service

3. **Frontend Applications**
   - React Web Application
   - Telegram Mini App
   - Progressive Web App (PWA)

4. **Data Platform**
   - Supabase PostgreSQL Database
   - Fivetran for data ingestion
   - dbt for data transformations
   - Dataiku for ML model management

5. **External Integrations**
   - Flight APIs (Amadeus, Skyscanner)
   - Hotel APIs (Booking.com, Expedia)
   - Payment Providers (Stripe, PayPal)
   - AI Services (Z.ai GLM-4.6)

## Data Flow Architecture
The system implements a comprehensive data pipeline:

\`\`\`mermaid
graph TD
    A[External APIs] --> B[Fivetran Ingestion]
    B --> C[Supabase Raw Data]
    C --> D[dbt Staging Models]
    D --> E[dbt Mart Models]
    E --> F[Business Intelligence]
    E --> G[Dataiku ML Training]
    G --> H[Model Deployment]
    H --> I[Prediction Services]
    F --> J[Grafana Dashboards]
    C --> K[Collibra Governance]
\`\`\`

## Deployment Architecture
- **Development**: Local development with hot reload
- **Staging**: Pre-production testing environment
- **Production**: Multi-region deployment with auto-scaling
            `
          },
          {
            title: 'Technology Stack',
            content: `
# Technology Stack

## Backend Technologies
- **Runtime**: Node.js 18+ with ES2023 features
- **Framework**: Express.js with custom middleware
- **Authentication**: JWT with refresh token rotation
- **Database**: Supabase (PostgreSQL) with connection pooling
- **Caching**: Redis with hybrid caching strategy
- **Message Queue**: Confluent Cloud Kafka for event streaming
- **API Documentation**: OpenAPI 3.0 with Swagger UI

## Frontend Technologies
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Query for server state management
- **Testing**: Vitest for unit tests, Playwright for E2E tests
- **PWA**: Service workers for offline functionality

## Data & Analytics
- **Data Ingestion**: Fivetran for automated data pipeline management
- **Data Transformation**: dbt for reliable and version-controlled transformations
- **Business Intelligence**: Custom analytics models for KPIs and reporting
- **ML Platform**: Dataiku DSS for model development and deployment
- **Data Governance**: Collibra for enterprise data governance

## DevOps & Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose for local development
- **CI/CD**: GitHub Actions with automated testing and deployment
- **Monitoring**: Prometheus metrics with Grafana visualization
- **Logging**: Structured logging with correlation IDs
- **Alerting**: Custom alert rules for business-critical metrics

## External Services
- **AI/ML**: Z.ai GLM-4.6 for conversational AI
- **Payment Processing**: Stripe for payments, PayPal for alternative payments
- **Travel APIs**: Amadeus for flights, Booking.com for hotels
- **Communication**: Telegram Bot API for messaging
- **Cloud Services**: Supabase for backend-as-a-service
            `
          }
        ]
      };

      const filePath = path.join(this.exportDir, 'documentation', `system-overview-${this.timestamp}.json`);
      fs.writeFileSync(filePath, JSON.stringify(overview, null, 2));

      logger.info('System overview documentation generated successfully', { filePath });
      return filePath;

    } catch (error) {
      logger.error('Failed to generate system overview documentation', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate API documentation
   */
  async generateAPIDocumentation() {
    try {
      logger.info('Generating API documentation...');

      const apiDocs = {
        title: 'Amrikyy Travel Agent - API Documentation',
        version: '1.0.0',
        baseUrl: 'https://api.amrikyy-travel-agent.com',
        exportDate: new Date().toISOString(),
        endpoints: [
          {
            path: '/api/auth/login',
            method: 'POST',
            description: 'User authentication and JWT token generation',
            parameters: [
              { name: 'email', type: 'string', required: true, description: 'User email address' },
              { name: 'password', type: 'string', required: true, description: 'User password' }
            ],
            responses: {
              '200': { description: 'Authentication successful', schema: 'AuthResponse' },
              '401': { description: 'Invalid credentials' },
              '429': { description: 'Rate limit exceeded' }
            }
          },
          {
            path: '/api/trips/plan',
            method: 'POST',
            description: 'Generate personalized trip recommendations',
            parameters: [
              { name: 'origin', type: 'string', required: true, description: 'Departure city' },
              { name: 'destination', type: 'string', required: true, description: 'Arrival city' },
              { name: 'departureDate', type: 'string', required: true, description: 'Departure date (ISO 8601)' },
              { name: 'returnDate', type: 'string', required: false, description: 'Return date (ISO 8601)' },
              { name: 'budget', type: 'number', required: false, description: 'Trip budget in USD' },
              { name: 'preferences', type: 'object', required: false, description: 'User preferences and constraints' }
            ],
            responses: {
              '200': { description: 'Trip recommendations generated', schema: 'TripPlanResponse' },
              '400': { description: 'Invalid request parameters' },
              '500': { description: 'Internal server error' }
            }
          },
          {
            path: '/api/models/flight-price/predict',
            method: 'POST',
            description: 'Predict optimal flight prices',
            parameters: [
              { name: 'origin', type: 'string', required: true, description: 'Origin airport code' },
              { name: 'destination', type: 'string', required: true, description: 'Destination airport code' },
              { name: 'departureDate', type: 'string', required: true, description: 'Departure date' },
              { name: 'returnDate', type: 'string', required: false, description: 'Return date' },
              { name: 'passengers', type: 'number', required: false, description: 'Number of passengers', default: 1 }
            ],
            responses: {
              '200': { description: 'Price prediction successful', schema: 'PricePredictionResponse' },
              '400': { description: 'Invalid flight parameters' },
              '503': { description: 'ML service unavailable' }
            }
          },
          {
            path: '/api/models/hotel-price/predict',
            method: 'POST',
            description: 'Predict optimal hotel prices',
            parameters: [
              { name: 'city', type: 'string', required: true, description: 'City name' },
              { name: 'checkinDate', type: 'string', required: true, description: 'Check-in date' },
              { name: 'checkoutDate', type: 'string', required: true, description: 'Check-out date' },
              { name: 'guests', type: 'number', required: false, description: 'Number of guests', default: 2 },
              { name: 'roomType', type: 'string', required: false, description: 'Preferred room type' }
            ],
            responses: {
              '200': { description: 'Price prediction successful', schema: 'PricePredictionResponse' },
              '400': { description: 'Invalid hotel parameters' },
              '503': { description: 'ML service unavailable' }
            }
          },
          {
            path: '/api/models/churn/predict',
            method: 'POST',
            description: 'Predict user churn probability',
            parameters: [
              { name: 'userId', type: 'string', required: true, description: 'User identifier' },
              { name: 'features', type: 'object', required: true, description: 'User behavior features' }
            ],
            responses: {
              '200': { description: 'Churn prediction successful', schema: 'ChurnPredictionResponse' },
              '400': { description: 'Invalid user data' },
              '503': { description: 'ML service unavailable' }
            }
          },
          {
            path: '/api/payments/create-session',
            method: 'POST',
            description: 'Create Stripe payment session',
            parameters: [
              { name: 'amount', type: 'number', required: true, description: 'Payment amount in cents' },
              { name: 'currency', type: 'string', required: true, description: 'Currency code (USD, EUR, etc.)' },
              { name: 'description', type: 'string', required: true, description: 'Payment description' },
              { name: 'metadata', type: 'object', required: false, description: 'Additional payment metadata' }
            ],
            responses: {
              '200': { description: 'Payment session created', schema: 'PaymentSessionResponse' },
              '400': { description: 'Invalid payment parameters' },
              '500': { description: 'Payment service error' }
            }
          }
        ],
        schemas: {
          AuthResponse: {
            type: 'object',
            properties: {
              token: { type: 'string', description: 'JWT access token' },
              refreshToken: { type: 'string', description: 'JWT refresh token' },
              user: { type: 'object', description: 'User profile information' },
              expiresIn: { type: 'number', description: 'Token expiration time in seconds' }
            }
          },
          TripPlanResponse: {
            type: 'object',
            properties: {
              tripId: { type: 'string', description: 'Unique trip identifier' },
              recommendations: { type: 'array', description: 'Array of trip recommendations' },
              totalPrice: { type: 'number', description: 'Estimated total trip cost' },
              confidence: { type: 'number', description: 'Recommendation confidence score' }
            }
          },
          PricePredictionResponse: {
            type: 'object',
            properties: {
              predictedPrice: { type: 'number', description: 'Predicted price' },
              confidence: { type: 'number', description: 'Prediction confidence (0-1)' },
              priceRange: { type: 'object', description: 'Price range with min/max values' },
              bestBookingDate: { type: 'string', description: 'Optimal booking date' }
            }
          },
          ChurnPredictionResponse: {
            type: 'object',
            properties: {
              churnProbability: { type: 'number', description: 'Churn probability (0-1)' },
              riskLevel: { type: 'string', description: 'Risk level (low/medium/high)' },
              recommendations: { type: 'array', description: 'Retention recommendations' }
            }
          },
          PaymentSessionResponse: {
            type: 'object',
            properties: {
              sessionId: { type: 'string', description: 'Stripe session identifier' },
              url: { type: 'string', description: 'Stripe checkout URL' },
              expiresAt: { type: 'number', description: 'Session expiration timestamp' }
            }
          }
        }
      };

      const filePath = path.join(this.exportDir, 'documentation', `api-documentation-${this.timestamp}.json`);
      fs.writeFileSync(filePath, JSON.stringify(apiDocs, null, 2));

      logger.info('API documentation generated successfully', { filePath });
      return filePath;

    } catch (error) {
      logger.error('Failed to generate API documentation', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate deployment guide
   */
  async generateDeploymentGuide() {
    try {
      logger.info('Generating deployment guide...');

      const deploymentGuide = {
        title: 'Amrikyy Travel Agent - Deployment Guide',
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        sections: [
          {
            title: 'Prerequisites',
            content: `
# Prerequisites

## System Requirements
- **Operating System**: Ubuntu 20.04+ or macOS 12+
- **Memory**: Minimum 8GB RAM, Recommended 16GB+
- **Storage**: Minimum 50GB free space
- **Network**: Stable internet connection for external API calls

## Required Software
- **Node.js**: Version 18.0 or higher
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: Version 2.30 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)

## External Services
- **Supabase Account**: For database and authentication
- **Stripe Account**: For payment processing
- **Telegram Bot Token**: For bot functionality
- **Dataiku DSS**: For ML model management (optional)
- **Collibra**: For data governance (optional)
- **Grafana Cloud**: For monitoring dashboards (optional)
            `
          },
          {
            title: 'Environment Setup',
            content: `
# Environment Setup

## 1. Clone Repository
\`\`\`bash
git clone https://github.com/your-org/amrikyy-travel-agent.git
cd amrikyy-travel-agent
\`\`\`

## 2. Install Dependencies
\`\`\`bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
\`\`\`

## 3. Environment Configuration
Copy environment templates and configure:

\`\`\`bash
# Backend environment
cp backend/env.example backend/.env
# Edit backend/.env with your configuration

# Frontend environment
cp frontend/env.example frontend/.env
# Edit frontend/.env with your configuration
\`\`\`

## 4. Database Setup
\`\`\`bash
# Initialize Supabase project
supabase init
supabase start

# Run database migrations
supabase db push
\`\`\`
            `
          },
          {
            title: 'Deployment Options',
            content: `
# Deployment Options

## Option 1: Docker Compose (Recommended for Development)
\`\`\`bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
\`\`\`

## Option 2: Manual Deployment
\`\`\`bash
# Start backend
cd backend
npm run dev

# Start frontend (in new terminal)
cd frontend
npm run dev
\`\`\`

## Option 3: Production Deployment
\`\`\`bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
\`\`\`
            `
          },
          {
            title: 'Configuration Validation',
            content: `
# Configuration Validation

## Health Checks
\`\`\`bash
# Backend health check
curl http://localhost:5000/health

# Database connection test
curl http://localhost:5000/api/test-db

# External API connectivity
curl http://localhost:5000/api/test-apis
\`\`\`

## Service Validation
- [ ] Backend service starts without errors
- [ ] Database connections established
- [ ] External API keys validated
- [ ] Frontend builds successfully
- [ ] Authentication flow works
- [ ] Payment processing functional
- [ ] ML model endpoints responding
            `
          }
        ]
      };

      const filePath = path.join(this.exportDir, 'documentation', `deployment-guide-${this.timestamp}.json`);
      fs.writeFileSync(filePath, JSON.stringify(deploymentGuide, null, 2));

      logger.info('Deployment guide generated successfully', { filePath });
      return filePath;

    } catch (error) {
      logger.error('Failed to generate deployment guide', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate user guide
   */
  async generateUserGuide() {
    try {
      logger.info('Generating user guide...');

      const userGuide = {
        title: 'Amrikyy Travel Agent - User Guide',
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        sections: [
          {
            title: 'Getting Started',
            content: `
# Getting Started with Amrikyy Travel Agent

## Welcome
Amrikyy Travel Agent is your AI-powered travel companion that helps you plan perfect trips, find the best deals, and book seamlessly.

## Key Features
- **Smart Trip Planning**: AI analyzes your preferences to suggest personalized itineraries
- **Price Predictions**: ML models predict optimal booking times for flights and hotels
- **Real-time Deals**: Get notified about flash sales and special offers
- **Multi-platform Access**: Use via web app, Telegram bot, or mobile app
- **Secure Payments**: Integrated payment processing with multiple options
            `
          },
          {
            title: 'Planning Your Trip',
            content: `
# Planning Your Trip

## Basic Trip Planning
1. **Set Your Destination**: Tell Amrikyy where you want to go
2. **Choose Dates**: Specify your travel dates
3. **Set Budget**: Define your spending limits
4. **Add Preferences**: Specify accommodation type, activities, dietary requirements

## Advanced Features
- **Price Optimization**: Get recommendations for the best booking times
- **Personalization**: Amrikyy learns from your past trips and preferences
- **Group Planning**: Coordinate trips with friends and family
- **Real-time Adjustments**: Modify plans as circumstances change

## AI Chat Interface
Amrikyy's conversational AI helps you:
- Answer questions about destinations
- Provide local insights and tips
- Suggest activities and attractions
- Handle booking modifications
- Provide travel advice and recommendations
            `
          },
          {
            title: 'Booking and Payments',
            content: `
# Booking and Payments

## Secure Booking Process
1. **Review Recommendations**: Amrikyy presents personalized options
2. **Compare Options**: View detailed comparisons of flights, hotels, and activities
3. **Select and Customize**: Choose your preferred options and make modifications
4. **Secure Payment**: Complete booking with integrated payment processing

## Payment Options
- **Credit/Debit Cards**: Visa, Mastercard, American Express
- **Digital Wallets**: PayPal, Apple Pay, Google Pay
- **Bank Transfers**: Direct bank transfers for large bookings
- **Installments**: Flexible payment plans for expensive trips

## Booking Management
- **View All Bookings**: Access your complete travel history
- **Modify Bookings**: Change dates, upgrade options, add services
- **Cancellation Support**: Easy cancellation and refund processing
- **Travel Insurance**: Optional insurance coverage for peace of mind
            `
          },
          {
            title: 'Using the Telegram Bot',
            content: `
# Telegram Bot Features

## Getting Started
1. **Find the Bot**: Search for @AmrikyyTravelAgentBot on Telegram
2. **Start Conversation**: Send /start to begin
3. **Link Account**: Connect your Amrikyy account for personalized service

## Available Commands
- **/start**: Initialize your Amrikyy experience
- **/plan**: Start planning a new trip
- **/bookings**: View your current bookings
- **/help**: Get assistance and command list
- **/settings**: Manage your preferences and notifications

## Conversational Features
- **Natural Language**: Chat naturally about your travel needs
- **Voice Messages**: Send voice notes for complex queries
- **Photo Sharing**: Share destination photos for recommendations
- **Real-time Updates**: Get instant notifications about your trips
            `
          }
        ]
      };

      const filePath = path.join(this.exportDir, 'documentation', `user-guide-${this.timestamp}.json`);
      fs.writeFileSync(filePath, JSON.stringify(userGuide, null, 2));

      logger.info('User guide generated successfully', { filePath });
      return filePath;

    } catch (error) {
      logger.error('Failed to generate user guide', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate operational procedures
   */
  async generateOperationalProcedures() {
    try {
      logger.info('Generating operational procedures...');

      const procedures = {
        title: 'Amrikyy Travel Agent - Operational Procedures',
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        procedures: [
          {
            title: 'Daily Operations',
            checklist: [
              'Monitor system health dashboards',
              'Review error logs and alerts',
              'Check payment processing status',
              'Verify external API connectivity',
              'Monitor ML model performance',
              'Review user feedback and support tickets'
            ]
          },
          {
            title: 'Weekly Maintenance',
            checklist: [
              'Update system dependencies',
              'Review and rotate API keys',
              'Backup database and configurations',
              'Analyze system performance metrics',
              'Update ML models with new data',
              'Review security logs and access patterns'
            ]
          },
          {
            title: 'Monthly Procedures',
            checklist: [
              'Generate monthly performance reports',
              'Review and optimize system costs',
              'Update compliance documentation',
              'Conduct security vulnerability assessment',
              'Review and update disaster recovery plans',
              'Analyze user behavior patterns and trends'
            ]
          },
          {
            title: 'Incident Response',
            procedures: [
              {
                scenario: 'Service Outage',
                steps: [
                  'Assess impact and notify stakeholders',
                  'Check monitoring dashboards for root cause',
                  'Implement temporary workaround if available',
                  'Deploy fix to staging environment',
                  'Conduct thorough testing',
                  'Deploy to production with rollback plan',
                  'Monitor system recovery',
                  'Document incident and lessons learned'
                ]
              },
              {
                scenario: 'Payment Processing Failure',
                steps: [
                  'Verify Stripe/PayPal service status',
                  'Check API key validity and permissions',
                  'Review payment logs for error patterns',
                  'Implement payment queue if applicable',
                  'Contact payment provider support if needed',
                  'Process failed payments manually if critical',
                  'Update payment processing logic',
                  'Test payment flow thoroughly'
                ]
              },
              {
                scenario: 'ML Model Performance Degradation',
                steps: [
                  'Monitor model accuracy and latency metrics',
                  'Check for data drift or concept drift',
                  'Review recent data quality issues',
                  'Retrain model with recent data if needed',
                  'Validate model performance on test set',
                  'Deploy updated model with A/B testing',
                  'Monitor performance after deployment',
                  'Update model documentation and version'
                ]
              }
            ]
          },
          {
            title: 'Backup and Recovery',
            procedures: [
              {
                type: 'Database Backup',
                frequency: 'Daily',
                procedure: [
                  'Automated backup via Supabase scheduled backups',
                  'Verify backup integrity and completeness',
                  'Test restore procedure monthly',
                  'Store backups in multiple geographic regions',
                  'Retention policy: 30 days for daily, 1 year for monthly'
                ]
              },
              {
                type: 'Configuration Backup',
                frequency: 'On Change',
                procedure: [
                  'Version control all configuration files',
                  'Automated export of environment configurations',
                  'Secure storage of sensitive configuration data',
                  'Regular validation of configuration integrity'
                ]
              },
              {
                type: 'ML Model Backup',
                frequency: 'Weekly',
                procedure: [
                  'Export model artifacts and metadata',
                  'Version control model configurations',
                  'Backup training data and evaluation metrics',
                  'Document model lineage and dependencies'
                ]
              }
            ]
          }
        ]
      };

      const filePath = path.join(this.exportDir, 'documentation', `operational-procedures-${this.timestamp}.json`);
      fs.writeFileSync(filePath, JSON.stringify(procedures, null, 2));

      logger.info('Operational procedures generated successfully', { filePath });
      return filePath;

    } catch (error) {
      logger.error('Failed to generate operational procedures', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate all documentation
   */
  async generateAllDocumentation() {
    try {
      logger.info('Starting comprehensive documentation generation...');

      const results = await Promise.all([
        this.generateSystemOverview(),
        this.generateAPIDocumentation(),
        this.generateDeploymentGuide(),
        this.generateUserGuide(),
        this.generateOperationalProcedures()
      ]);

      logger.info('Documentation generation completed successfully', {
        count: results.length,
        files: results
      });

      return results;

    } catch (error) {
      logger.error('Documentation generation failed', { error: error.message });
      throw error;
    }
  }
}

// Execute export if run directly
if (require.main === module) {
  const exporter = new DocumentationExporter();
  exporter.generateAllDocumentation()
    .then(() => {
      logger.info('Documentation export process completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Documentation export process failed', { error: error.message });
      process.exit(1);
    });
}

module.exports = DocumentationExporter;
