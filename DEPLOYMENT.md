# Maya Travel Agent - Production Deployment Guide

## 🚀 Overview

This guide covers the complete deployment process for the Maya Travel Agent Telegram bot with enterprise-grade features.

## ✅ Pre-Deployment Checklist

### 1. Environment Variables

Ensure all required environment variables are set in `.env`:

```bash
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Z.ai API (GLM-4.6)
ZAI_API_KEY=your_zai_api_key
ZAI_API_BASE_URL=https://api.z.ai/api/paas/v4
ZAI_MODEL=glm-4.6
ZAI_MAX_TOKENS=2000
ZAI_TEMPERATURE=0.7

# Supabase (Optional - falls back to memory storage)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key

# Payment (Optional)
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Application
PORT=5000
NODE_ENV=production
LOG_LEVEL=INFO
```

### 2. Dependencies

Install all dependencies:

```bash
cd backend
npm install
```

### 3. Database Setup

If using Supabase, ensure tables are created:

- `profiles` - User profiles
- `messages` - Conversation history
- `travel_offers` - Travel packages
- `offer_interactions` - User interactions

If not using Supabase, the bot will automatically use in-memory storage.

## 🏗️ Architecture

### Core Components

1. **Telegram Bot** (`telegram-bot.js`)
   - Main bot interface
   - Command handlers
   - Callback query handlers
   - Message routing

2. **Conversation Manager** (`utils/conversationManager.js`)
   - State management
   - Context tracking
   - Intent analysis
   - History management

3. **Z.ai Integration** (`src/ai/zaiClient.js`)
   - GLM-4.6 API client
   - Travel recommendations
   - Budget analysis
   - General conversation

4. **Error Handler** (`utils/errorHandler.js`)
   - Centralized error handling
   - Circuit breaker pattern
   - Retry logic
   - Graceful degradation

5. **Logger** (`utils/logger.js`)
   - Structured logging
   - Multiple log levels
   - File rotation
   - Performance tracking

6. **Health Monitor** (`utils/healthMonitor.js`)
   - System health checks
   - API status monitoring
   - Performance metrics
   - Uptime tracking

## 🚀 Deployment Steps

### Option 1: Direct Node.js

```bash
# Navigate to backend
cd backend

# Start the bot
node telegram-bot.js
```

### Option 2: PM2 (Recommended for Production)

```bash
# Install PM2 globally
npm install -g pm2

# Start bot with PM2
pm2 start telegram-bot.js --name maya-bot

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

### Option 3: Docker

```bash
# Build Docker image
docker build -t maya-travel-bot .

# Run container
docker run -d \
  --name maya-bot \
  --env-file .env \
  --restart unless-stopped \
  maya-travel-bot
```

### Option 4: Systemd Service

Create `/etc/systemd/system/maya-bot.service`:

```ini
[Unit]
Description=Maya Travel Agent Bot
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/maya-travel-agent/backend
ExecStart=/usr/bin/node telegram-bot.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable maya-bot
sudo systemctl start maya-bot
sudo systemctl status maya-bot
```

## 📊 Monitoring

### Health Checks

The bot includes built-in health monitoring:

```bash
# Check health via bot command
/health

# Or programmatically
curl http://localhost:5000/health
```

### Logs

Logs are stored in `backend/logs/`:

- `all.log` - All log messages
- `error.log` - Error messages only
- `warn.log` - Warning messages
- `info.log` - Info messages
- `debug.log` - Debug messages

View logs:

```bash
# Real-time logs
tail -f backend/logs/all.log

# Error logs
tail -f backend/logs/error.log

# With PM2
pm2 logs maya-bot
```

### Metrics

Access metrics via the bot:

```bash
# User statistics
/stats

# System health
/health
```

## 🔧 Configuration

### Log Levels

Set `LOG_LEVEL` in `.env`:

- `ERROR` - Only errors
- `WARN` - Warnings and errors
- `INFO` - General information (default)
- `DEBUG` - Detailed debugging

### Performance Tuning

Adjust in `.env`:

```bash
# Z.ai settings
ZAI_MAX_TOKENS=2000          # Max response length
ZAI_TEMPERATURE=0.7          # Creativity (0-1)
ZAI_ENABLE_KV_OFFLOAD=true   # Memory optimization

# Conversation settings
CONVERSATION_TIMEOUT=1800000  # 30 minutes
MAX_HISTORY_LENGTH=50         # Messages to keep
```

## 🛡️ Security

### Best Practices

1. **Never commit `.env` file**
2. **Use environment-specific configurations**
3. **Rotate API keys regularly**
4. **Enable HTTPS for webhooks**
5. **Implement rate limiting**
6. **Monitor for suspicious activity**

### Secrets Management

Use a secrets manager in production:

- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault
- Google Secret Manager

## 🔄 Updates and Maintenance

### Update Process

```bash
# Pull latest changes
git pull origin main

# Install dependencies
cd backend && npm install

# Restart bot
pm2 restart maya-bot

# Or with systemd
sudo systemctl restart maya-bot
```

### Database Maintenance

```bash
# Clean old conversations (if using Supabase)
# Automatically handled by the bot every 30 days

# Manual cleanup
node -e "require('./database/supabase').clearOldConversations()"
```

### Log Rotation

Logs are automatically rotated every 7 days. Manual rotation:

```bash
# Rotate logs
node -e "require('./utils/logger').rotateLogs()"
```

## 🐛 Troubleshooting

### Bot Not Responding

1. Check bot is running:
   ```bash
   pm2 status maya-bot
   # or
   sudo systemctl status maya-bot
   ```

2. Check logs:
   ```bash
   pm2 logs maya-bot --lines 100
   # or
   tail -100 backend/logs/error.log
   ```

3. Verify Telegram token:
   ```bash
   curl https://api.telegram.org/bot<YOUR_TOKEN>/getMe
   ```

### Z.ai API Errors

1. Check API key validity
2. Verify account balance
3. Check rate limits
4. Review error logs

### Database Connection Issues

1. Verify Supabase credentials
2. Check network connectivity
3. Bot will fallback to memory storage automatically

### High Memory Usage

1. Reduce `MAX_HISTORY_LENGTH`
2. Enable `ZAI_ENABLE_KV_OFFLOAD`
3. Restart bot periodically
4. Monitor with `pm2 monit`

## 📈 Scaling

### Horizontal Scaling

For high traffic:

1. Use webhook mode instead of polling
2. Deploy multiple instances behind load balancer
3. Use Redis for shared state
4. Implement message queue (RabbitMQ/Kafka)

### Vertical Scaling

Increase resources:

```bash
# PM2 cluster mode
pm2 start telegram-bot.js -i max --name maya-bot
```

## 🧪 Testing

Run tests before deployment:

```bash
cd backend
node test-bot.js
```

Expected output:
```
✅ Logger
✅ Conversation Manager
✅ Supabase DB
✅ Z.ai Client
✅ Health Monitor
✅ Intent Analysis
✅ Conversation Statistics

Success Rate: 100%
```

## 📞 Support

For issues or questions:

- GitHub Issues: [Repository Issues](https://github.com/Moeabdelaziz007/maya-travel-agent/issues)
- Email: support@mayatrips.com
- Telegram: @MayaTripsSupport

## 📝 License

See LICENSE file for details.

---

**Last Updated:** 2025-10-08
**Version:** 1.0.0
**Status:** Production Ready ✅
