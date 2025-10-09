# 🛡️ Rate Limiting Guide - Maya Travel Agent

## Overview

Rate limiting has been implemented across all API endpoints to protect the service from abuse, ensure fair usage, and prevent excessive costs from AI API calls.

---

## 📊 Rate Limit Tiers

### 1. **General API Limiter**
- **Applies to**: All `/api/*` routes
- **Limit**: 100 requests per 15 minutes per IP
- **Purpose**: General protection against API abuse

```javascript
// Applied automatically to all API routes
app.use('/api/', generalLimiter);
```

---

### 2. **AI Endpoints Limiter** ⚡
- **Applies to**: `/api/ai/*` routes
- **Limit**: 10 requests per minute per IP
- **Purpose**: Protect expensive AI API calls (Z.ai GLM-4.6)

**Affected Endpoints:**
- `POST /api/ai/chat`
- `POST /api/ai/travel-recommendations`
- `POST /api/ai/budget-analysis`
- `POST /api/ai/destination-insights`
- `POST /api/ai/payment-recommendations`

**Why strict?**
- AI calls are expensive
- Prevents cost overruns
- Ensures service availability for all users

---

### 3. **Multimodal AI Limiter** 🖼️
- **Applies to**: `/api/ai/multimodal/analyze`
- **Limit**: 20 requests per hour per IP
- **Purpose**: Image/video analysis is very expensive

**Why very strict?**
- Multimodal AI is 5-10x more expensive than text
- Processing images/videos requires significant resources
- Prevents abuse of the most expensive feature

---

### 4. **Payment Endpoints Limiter** 💳
- **Applies to**: `/api/payment/*` routes
- **Limit**: 20 requests per hour per IP
- **Purpose**: Prevent payment spam and fraud attempts

**Affected Endpoints:**
- `POST /api/payment/create-payment-link`
- `POST /api/payment/create-payment`
- `POST /api/payment/confirm-payment`
- `GET /api/payment/payment-status/:id`

**Features:**
- Skips failed requests (doesn't count towards limit)
- Logs suspicious activity
- Protects against payment fraud

---

### 5. **Webhook Limiter** 🔗
- **Applies to**: Webhook endpoints
- **Limit**: 30 requests per minute per IP
- **Purpose**: Protect webhook endpoints from spam

**Affected Endpoints:**
- `POST /api/payment/webhook` (Stripe)
- `POST /api/whatsapp/webhook`
- `POST /api/telegram/webhook`

---

### 6. **Analytics Limiter** 📈
- **Applies to**: `/api/analytics/events`
- **Limit**: 50 events per minute per IP
- **Purpose**: Prevent analytics spam

---

### 7. **Authentication Limiter** 🔐
- **Applies to**: Auth endpoints (when implemented)
- **Limit**: 5 attempts per 15 minutes per IP
- **Purpose**: Prevent brute force attacks

**Features:**
- Skips successful logins (doesn't count towards limit)
- Temporary account lock on excessive attempts
- Security logging

---

## 🔧 Implementation Details

### Middleware Location
```
backend/middleware/rateLimiter.js
```

### Usage Example

```javascript
const { aiLimiter, paymentLimiter } = require('./middleware/rateLimiter');

// Apply to specific route
router.post('/expensive-operation', aiLimiter, async (req, res) => {
  // Your handler
});

// Apply to entire router
app.use('/api/ai', aiLimiter, aiRoutes);
```

---

## 📝 Response Format

When rate limit is exceeded, the API returns:

```json
{
  "success": false,
  "error": "Too many requests, please slow down.",
  "retryAfter": 900,
  "limit": 10,
  "window": "1 minute"
}
```

**HTTP Status Code**: `429 Too Many Requests`

**Headers Included:**
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Requests remaining in current window
- `RateLimit-Reset`: Timestamp when the limit resets

---

## 🎯 Best Practices for Clients

### 1. **Respect Rate Limits**
```javascript
// Check rate limit headers
const remaining = response.headers['ratelimit-remaining'];
const reset = response.headers['ratelimit-reset'];

if (remaining < 5) {
  console.warn('Approaching rate limit!');
}
```

### 2. **Implement Exponential Backoff**
```javascript
async function makeRequestWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      
      if (response.status === 429) {
        const retryAfter = response.headers['retry-after'] || Math.pow(2, i);
        await sleep(retryAfter * 1000);
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

### 3. **Cache Responses**
```javascript
// Cache AI responses to avoid repeated calls
const cache = new Map();

async function getCachedAIResponse(message) {
  if (cache.has(message)) {
    return cache.get(message);
  }
  
  const response = await callAI(message);
  cache.set(message, response);
  return response;
}
```

### 4. **Batch Requests**
```javascript
// Instead of multiple single requests
// Bad: 10 separate requests
for (const item of items) {
  await analyzeItem(item);
}

// Good: 1 batch request
await analyzeBatch(items);
```

---

## 🔍 Monitoring

### Check Rate Limit Status

```bash
# Make a request and check headers
curl -I https://api.maya-trips.com/api/ai/chat

# Response headers:
# RateLimit-Limit: 10
# RateLimit-Remaining: 7
# RateLimit-Reset: 1699564800
```

### Logs

Rate limit violations are logged:

```
⚠️ AI rate limit exceeded for IP: 192.168.1.100
⚠️ Payment rate limit exceeded for IP: 10.0.0.50
```

---

## 🛠️ Customization

### Create Custom Rate Limiter

```javascript
const { createCustomLimiter } = require('./middleware/rateLimiter');

const customLimiter = createCustomLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests
  message: {
    success: false,
    error: 'Custom rate limit exceeded'
  }
});

router.post('/custom-endpoint', customLimiter, handler);
```

---

## 📊 Rate Limit Summary Table

| Endpoint Type | Limit | Window | Purpose |
|--------------|-------|--------|---------|
| General API | 100 | 15 min | General protection |
| AI Chat | 10 | 1 min | Expensive AI calls |
| Multimodal AI | 20 | 1 hour | Very expensive |
| Payment | 20 | 1 hour | Fraud prevention |
| Webhooks | 30 | 1 min | Spam protection |
| Analytics | 50 | 1 min | Event spam prevention |
| Auth | 5 | 15 min | Brute force protection |

---

## 🚨 Troubleshooting

### "Too many requests" Error

**Problem**: Getting 429 errors

**Solutions**:
1. Wait for the rate limit window to reset
2. Implement request caching
3. Use exponential backoff
4. Batch multiple operations
5. Contact support for rate limit increase (if legitimate use case)

### Rate Limit Too Strict

**For Development**:
```javascript
// In development, you can increase limits
if (process.env.NODE_ENV === 'development') {
  aiLimiter.max = 100; // Increase for testing
}
```

**For Production**:
- Contact support with your use case
- Consider upgrading to a higher tier (if available)
- Optimize your request patterns

---

## 🔐 Security Benefits

1. **DDoS Protection**: Prevents overwhelming the server
2. **Cost Control**: Limits expensive AI API calls
3. **Fair Usage**: Ensures all users get fair access
4. **Fraud Prevention**: Limits payment spam attempts
5. **Brute Force Protection**: Prevents password guessing attacks

---

## 📈 Future Enhancements

### Planned Features:
- [ ] User-based rate limiting (not just IP)
- [ ] Redis-based distributed rate limiting
- [ ] Dynamic rate limits based on user tier
- [ ] Rate limit analytics dashboard
- [ ] Automatic rate limit adjustment based on load
- [ ] Whitelist for trusted IPs
- [ ] API key-based rate limiting

---

## 🤝 Support

If you're hitting rate limits and have a legitimate use case:

1. **Check your implementation**: Are you caching? Using exponential backoff?
2. **Review the logs**: Look for patterns in your requests
3. **Contact support**: Provide details about your use case
4. **Consider optimization**: Can you reduce the number of requests?

---

## 📚 References

- [Express Rate Limit Documentation](https://github.com/express-rate-limit/express-rate-limit)
- [HTTP 429 Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)

---

**Last Updated**: 2024-10-09  
**Version**: 1.0.0  
**Maintained by**: Maya Trips Team
