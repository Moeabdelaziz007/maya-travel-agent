# 📚 Maya Travel Agent - API Documentation

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Health & Status](#health--status)
  - [AI Services](#ai-services)
  - [Payment Services](#payment-services)
  - [Telegram Mini App](#telegram-mini-app)
  - [WhatsApp Integration](#whatsapp-integration)
  - [Analytics](#analytics)

---

## Overview

**Base URL**: `http://localhost:5000/api` (Development)  
**Production URL**: `https://api.maya-trips.com/api`

**API Version**: 1.0.0  
**Last Updated**: 2024-10-09

### Technology Stack
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **AI Provider**: Z.ai GLM-4.6
- **Payment**: Stripe, PayPal
- **Messaging**: Telegram Bot API, WhatsApp Business API

---

## Authentication

### Telegram WebApp Authentication

**Endpoint**: `POST /api/telegram/auth/telegram`

**Description**: Authenticate users via Telegram WebApp initData

**Request Body**:
```json
{
  "initData": "query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A279058397..."
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "profile": {
    "telegram_id": "279058397",
    "username": "john_doe",
    "avatar_url": "https://..."
  }
}
```

**Status Codes**:
- `200` - Success
- `401` - Invalid Telegram data
- `500` - Server error

---

## Rate Limiting

All endpoints are protected by rate limiting. See [RATE_LIMITING_GUIDE.md](./RATE_LIMITING_GUIDE.md) for details.

### Rate Limit Headers

Every response includes:
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1699564800
```

### Rate Limit Response (429)

```json
{
  "success": false,
  "error": "Too many requests, please slow down.",
  "retryAfter": 900,
  "limit": 10,
  "window": "1 minute"
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## Endpoints

### Health & Status

#### Get Server Health

**Endpoint**: `GET /api/health`

**Description**: Check server health and status

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-10-09T12:00:00.000Z",
  "uptime": 3600,
  "memory": {
    "rss": 52428800,
    "heapTotal": 20971520,
    "heapUsed": 15728640,
    "external": 1048576
  }
}
```

**Rate Limit**: 100 requests / 15 minutes

---

#### Get API Information

**Endpoint**: `GET /`

**Description**: Get API version and status

**Response**:
```json
{
  "message": "Maya Trips API Server",
  "version": "1.0.0",
  "status": "running",
  "timestamp": "2024-10-09T12:00:00.000Z"
}
```

---

#### Ping Endpoint

**Endpoint**: `GET /api/public/ping`

**Description**: Simple ping endpoint for connectivity testing

**Response**:
```json
{
  "ok": true,
  "ts": 1699564800000
}
```

---

### AI Services

#### Chat with AI

**Endpoint**: `POST /api/ai/chat`

**Description**: Send a message to Maya AI assistant

**Rate Limit**: 10 requests / minute

**Request Body**:
```json
{
  "message": "I want to travel to Turkey",
  "userId": "user123",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Previous message"
    },
    {
      "role": "assistant",
      "content": "Previous response"
    }
  ],
  "useTools": false,
  "region": "ar"
}
```

**Parameters**:
- `message` (required): User's message
- `userId` (optional): User identifier for tracking
- `conversationHistory` (optional): Previous conversation context
- `useTools` (optional): Enable tool calling (default: false)
- `region` (optional): Language/region code (ar/en, default: ar)

**Response**:
```json
{
  "success": true,
  "reply": "مرحباً! سأساعدك في التخطيط لرحلتك إلى تركيا...",
  "timestamp": "2024-10-09T12:00:00.000Z",
  "model": "glm-4.6"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "AI service error",
  "reply": "Fallback response"
}
```

---

#### Get Travel Recommendations

**Endpoint**: `POST /api/ai/travel-recommendations`

**Description**: Generate AI-powered travel recommendations

**Rate Limit**: 10 requests / minute

**Request Body**:
```json
{
  "destination": "Tokyo, Japan",
  "budget": 3000,
  "duration": 7,
  "preferences": ["culture", "food", "shopping"]
}
```

**Parameters**:
- `destination` (required): Travel destination
- `budget` (required): Total budget in USD
- `duration` (required): Trip duration in days
- `preferences` (optional): Array of preferences

**Response**:
```json
{
  "success": true,
  "recommendations": "Based on your budget of $3000 for 7 days in Tokyo...",
  "destination": "Tokyo, Japan",
  "budget": 3000,
  "duration": 7,
  "timestamp": "2024-10-09T12:00:00.000Z"
}
```

---

#### Budget Analysis

**Endpoint**: `POST /api/ai/budget-analysis`

**Description**: Analyze trip budget and provide recommendations

**Rate Limit**: 10 requests / minute

**Request Body**:
```json
{
  "tripData": {
    "destination": "Paris, France",
    "duration": 5,
    "travelers": 2
  },
  "totalBudget": 4000
}
```

**Response**:
```json
{
  "success": true,
  "analysis": "For a 5-day trip to Paris with 2 travelers and $4000 budget...",
  "tripData": {...},
  "totalBudget": 4000,
  "timestamp": "2024-10-09T12:00:00.000Z"
}
```

---

#### Destination Insights

**Endpoint**: `POST /api/ai/destination-insights`

**Description**: Get detailed insights about a destination

**Rate Limit**: 10 requests / minute

**Request Body**:
```json
{
  "destination": "Dubai, UAE",
  "travelType": "leisure"
}
```

**Parameters**:
- `destination` (required): Destination name
- `travelType` (optional): Type of travel (leisure/business/adventure, default: leisure)

**Response**:
```json
{
  "success": true,
  "insights": "Dubai is a modern metropolis known for...",
  "destination": "Dubai, UAE",
  "travelType": "leisure",
  "timestamp": "2024-10-09T12:00:00.000Z"
}
```

---

#### Multimodal Analysis

**Endpoint**: `POST /api/ai/multimodal/analyze`

**Description**: Analyze images or videos for trip planning insights

**Rate Limit**: 20 requests / hour (Very expensive operation)

**Request Body**:
```json
{
  "prompt": "Analyze this destination photo and suggest activities",
  "imageUrls": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "videoUrl": null,
  "options": {
    "temperature": 0.4,
    "maxTokens": 900,
    "enableKvCacheOffload": true,
    "attentionImpl": "flash-attn-3"
  }
}
```

**Parameters**:
- `prompt` (optional): Analysis prompt
- `imageUrls` (optional): Array of image URLs
- `videoUrl` (optional): Video URL
- `options` (optional): AI model options

**Response**:
```json
{
  "success": true,
  "analysis": "This image shows a beautiful beach destination...",
  "providerData": {...},
  "timestamp": "2024-10-09T12:00:00.000Z"
}
```

---

#### AI Health Check

**Endpoint**: `GET /api/ai/health`

**Description**: Check AI service availability

**Response**:
```json
{
  "success": true,
  "status": "healthy",
  "service": "Z.ai GLM-4.6",
  "timestamp": "2024-10-09T12:00:00.000Z",
  "error": null
}
```

---

#### Get Available Models

**Endpoint**: `GET /api/ai/models`

**Description**: Get information about available AI models

**Response**:
```json
{
  "success": true,
  "models": {
    "primary": "glm-4.6",
    "capabilities": [
      "text_generation",
      "travel_planning",
      "budget_analysis",
      "destination_insights",
      "payment_recommendations",
      "multilingual_support"
    ],
    "languages": ["Arabic", "English"],
    "maxTokens": 2000,
    "temperature": 0.7
  },
  "timestamp": "2024-10-09T12:00:00.000Z"
}
```

---

### Payment Services

#### Create Payment Link

**Endpoint**: `POST /api/payment/create-payment-link`

**Description**: Create a Stripe payment link

**Rate Limit**: 20 requests / hour

**Request Body**:
```json
{
  "amount": 100.00,
  "currency": "USD",
  "description": "Trip to Tokyo",
  "customerEmail": "user@example.com"
}
```

**Parameters**:
- `amount` (required): Payment amount (must be > 0)
- `currency` (optional): Currency code (default: USD)
- `description` (optional): Payment description
- `customerEmail` (optional): Customer email

**Response**:
```json
{
  "success": true,
  "paymentLink": {
    "id": "plink_1234567890",
    "url": "https://checkout.stripe.com/pay/cs_test_...",
    "amount": 100.00,
    "currency": "USD",
    "description": "Trip to Tokyo",
    "status": "created"
  },
  "message": "Payment link created successfully"
}
```

---

#### Create Payment Intent

**Endpoint**: `POST /api/payment/create-payment`

**Description**: Create a payment intent with specified method

**Rate Limit**: 20 requests / hour

**Request Body**:
```json
{
  "amount": 150.00,
  "currency": "USD",
  "paymentMethod": "stripe",
  "description": "Hotel booking",
  "chatId": "123456789"
}
```

**Parameters**:
- `amount` (required): Payment amount
- `currency` (optional): Currency code
- `paymentMethod` (required): Payment method (stripe/paypal/telegram)
- `description` (optional): Payment description
- `chatId` (optional): Telegram chat ID (for telegram method)

**Response**:
```json
{
  "success": true,
  "payment": {
    "id": "pi_1234567890",
    "amount": 150.00,
    "currency": "USD",
    "status": "created"
  },
  "message": "Payment created successfully"
}
```

---

#### Confirm Payment

**Endpoint**: `POST /api/payment/confirm-payment`

**Description**: Confirm a payment

**Rate Limit**: 20 requests / hour

**Request Body**:
```json
{
  "paymentId": "pi_1234567890",
  "paymentMethod": "stripe"
}
```

**Response**:
```json
{
  "success": true,
  "confirmation": {
    "id": "pi_1234567890",
    "status": "succeeded",
    "confirmed_at": "2024-10-09T12:00:00.000Z",
    "method": "stripe"
  },
  "message": "Payment confirmed successfully"
}
```

---

#### Get Payment Status

**Endpoint**: `GET /api/payment/payment-status/:paymentId`

**Description**: Get the status of a payment

**Rate Limit**: 20 requests / hour

**Response**:
```json
{
  "success": true,
  "payment": {
    "id": "pi_1234567890",
    "status": "succeeded",
    "amount": 100.00,
    "currency": "USD",
    "created_at": "2024-10-09T11:00:00.000Z",
    "updated_at": "2024-10-09T12:00:00.000Z"
  }
}
```

---

### Telegram Mini App

#### Send Message

**Endpoint**: `POST /api/telegram/send-message`

**Description**: Send a message to a Telegram user

**Request Body**:
```json
{
  "message": "Your trip has been confirmed!",
  "chat_id": "123456789"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

---

#### Send Payment Link

**Endpoint**: `POST /api/telegram/send-payment-link`

**Description**: Create and send a payment link to a Telegram user

**Request Body**:
```json
{
  "amount": 200.00,
  "description": "Flight booking",
  "chat_id": "123456789"
}
```

**Response**:
```json
{
  "success": true,
  "paymentLink": "https://checkout.stripe.com/pay/...",
  "message": "Payment link sent successfully"
}
```

---

#### Share Trip

**Endpoint**: `POST /api/telegram/share-trip`

**Description**: Share trip details with a Telegram user

**Request Body**:
```json
{
  "trip": {
    "destination": "Tokyo, Japan",
    "startDate": "2024-03-15",
    "endDate": "2024-03-22",
    "budget": 2500
  },
  "chat_id": "123456789"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Trip shared successfully"
}
```

---

#### Get User Trips

**Endpoint**: `GET /api/telegram/user-trips?user_id=123`

**Description**: Get all trips for a user

**Query Parameters**:
- `user_id`: User identifier

**Response**:
```json
{
  "success": true,
  "trips": [
    {
      "id": "1",
      "destination": "Tokyo, Japan",
      "startDate": "2024-03-15",
      "endDate": "2024-03-22",
      "budget": 2500,
      "status": "planned"
    }
  ]
}
```

---

#### Sync User Data

**Endpoint**: `POST /api/telegram/sync-user`

**Description**: Sync user data from Telegram to database

**Request Body**:
```json
{
  "telegram_id": "123456789",
  "username": "john_doe",
  "first_name": "John",
  "last_name": "Doe",
  "preferences": {
    "language": "en",
    "currency": "USD"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "User data synced successfully"
}
```

---

#### Get Bot Commands

**Endpoint**: `GET /api/telegram/bot-commands`

**Description**: Get available bot commands

**Response**:
```json
{
  "success": true,
  "commands": [
    {
      "command": "start",
      "description": "Start the bot"
    },
    {
      "command": "help",
      "description": "Get help"
    },
    {
      "command": "payment",
      "description": "Create payment link"
    },
    {
      "command": "trip",
      "description": "Plan a trip"
    },
    {
      "command": "budget",
      "description": "Manage budget"
    }
  ]
}
```

---

#### Send Notification

**Endpoint**: `POST /api/telegram/send-notification`

**Description**: Send a notification to a Telegram user

**Request Body**:
```json
{
  "message": "Your payment was successful!",
  "type": "success",
  "chat_id": "123456789"
}
```

**Parameters**:
- `message` (required): Notification message
- `type` (required): Notification type (info/success/warning/error)
- `chat_id` (required): Telegram chat ID

**Response**:
```json
{
  "success": true,
  "message": "Notification sent successfully"
}
```

---

### WhatsApp Integration

#### Webhook Verification

**Endpoint**: `GET /api/whatsapp/webhook`

**Description**: Verify WhatsApp webhook

**Query Parameters**:
- `hub.mode`: Should be "subscribe"
- `hub.verify_token`: Verification token
- `hub.challenge`: Challenge string

**Response**: Returns the challenge string if verification succeeds

---

#### Webhook Handler

**Endpoint**: `POST /api/whatsapp/webhook`

**Description**: Receive incoming WhatsApp messages

**Request Body**: WhatsApp webhook payload

**Response**:
```json
{
  "success": true
}
```

---

### Analytics

#### Track Event

**Endpoint**: `POST /api/analytics/events`

**Description**: Track an analytics event

**Rate Limit**: 50 events / minute

**Request Body**:
```json
{
  "type": "page_view",
  "userId": "user123",
  "payload": {
    "page": "/destinations",
    "referrer": "/home"
  }
}
```

**Response**:
```json
{
  "success": true
}
```

---

#### Get Analytics Summary

**Endpoint**: `GET /api/analytics/summary`

**Description**: Get analytics summary

**Response**:
```json
{
  "total": 1250,
  "byType": {
    "page_view": 800,
    "button_click": 300,
    "form_submit": 150
  },
  "last10": [
    {
      "type": "page_view",
      "userId": "user123",
      "payload": {...},
      "ts": 1699564800000,
      "ua": "Mozilla/5.0..."
    }
  ]
}
```

---

## Code Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

// Chat with AI
async function chatWithAI(message) {
  try {
    const response = await axios.post('http://localhost:5000/api/ai/chat', {
      message: message,
      userId: 'user123',
      region: 'ar'
    });
    
    console.log(response.data.reply);
  } catch (error) {
    if (error.response?.status === 429) {
      console.log('Rate limit exceeded. Retry after:', error.response.data.retryAfter);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Create payment link
async function createPayment(amount, description) {
  try {
    const response = await axios.post('http://localhost:5000/api/payment/create-payment-link', {
      amount: amount,
      currency: 'USD',
      description: description
    });
    
    console.log('Payment URL:', response.data.paymentLink.url);
    return response.data.paymentLink;
  } catch (error) {
    console.error('Payment error:', error.response?.data || error.message);
  }
}
```

---

### Python

```python
import requests

# Chat with AI
def chat_with_ai(message):
    try:
        response = requests.post(
            'http://localhost:5000/api/ai/chat',
            json={
                'message': message,
                'userId': 'user123',
                'region': 'ar'
            }
        )
        response.raise_for_status()
        return response.json()['reply']
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 429:
            print(f"Rate limit exceeded. Retry after: {e.response.json()['retryAfter']}")
        else:
            print(f"Error: {e}")

# Create payment
def create_payment(amount, description):
    try:
        response = requests.post(
            'http://localhost:5000/api/payment/create-payment-link',
            json={
                'amount': amount,
                'currency': 'USD',
                'description': description
            }
        )
        response.raise_for_status()
        return response.json()['paymentLink']
    except requests.exceptions.RequestException as e:
        print(f"Payment error: {e}")
```

---

### cURL

```bash
# Chat with AI
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I want to travel to Turkey",
    "userId": "user123",
    "region": "ar"
  }'

# Create payment link
curl -X POST http://localhost:5000/api/payment/create-payment-link \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "currency": "USD",
    "description": "Trip booking"
  }'

# Get health status
curl http://localhost:5000/api/health
```

---

## Webhooks

### Stripe Webhook

**Endpoint**: `POST /api/payment/webhook`

**Description**: Receive Stripe webhook events

**Headers**:
- `stripe-signature`: Webhook signature for verification

**Events Handled**:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `checkout.session.completed`

---

### WhatsApp Webhook

**Endpoint**: `POST /api/whatsapp/webhook`

**Description**: Receive WhatsApp Business API webhooks

**Events Handled**:
- Incoming messages
- Message status updates
- User interactions

---

## Best Practices

### 1. Always Check Rate Limits
```javascript
const remaining = response.headers['ratelimit-remaining'];
if (remaining < 5) {
  console.warn('Approaching rate limit!');
}
```

### 2. Implement Retry Logic
```javascript
async function makeRequestWithRetry(url, data, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await axios.post(url, data);
    } catch (error) {
      if (error.response?.status === 429) {
        const retryAfter = error.response.data.retryAfter || Math.pow(2, i);
        await sleep(retryAfter * 1000);
        continue;
      }
      throw error;
    }
  }
}
```

### 3. Cache Responses
```javascript
const cache = new Map();

async function getCachedResponse(key, fetchFn) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const response = await fetchFn();
  cache.set(key, response);
  return response;
}
```

### 4. Handle Errors Gracefully
```javascript
try {
  const response = await api.call();
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error('API Error:', error.response.data);
  } else if (error.request) {
    // Request made but no response
    console.error('Network Error:', error.message);
  } else {
    // Something else happened
    console.error('Error:', error.message);
  }
}
```

---

## Support

For API support and questions:
- **GitHub Issues**: [Repository Issues](https://github.com/Moeabdelaziz007/maya-travel-agent/issues)
- **Documentation**: [Project Documentation](./README.md)
- **Rate Limiting**: [Rate Limiting Guide](./RATE_LIMITING_GUIDE.md)

---

**Last Updated**: 2024-10-09  
**API Version**: 1.0.0  
**Maintained by**: Maya Trips Team
