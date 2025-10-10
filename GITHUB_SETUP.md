# GitHub Setup Guide

## GitHub Secrets Configuration

To set up GitHub Secrets for secure environment variable management, follow these steps:

### 1. Access Repository Settings
1. Go to your GitHub repository
2. Click on "Settings" tab
3. Click on "Secrets and variables" in the left sidebar
4. Click on "Actions"

### 2. Add Required Secrets

Add the following secrets with their corresponding values:

#### Core Application Secrets
- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token from @BotFather
- `ZAI_API_KEY`: Your Z.ai API key for AI services
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `STRIPE_SECRET_KEY`: Your Stripe secret key for payments
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret

#### Optional/Caching Secrets
- `JSONBIN_API_KEY`: Your JSONbin.io API key for caching
- `RAILWAY_TOKEN`: Your Railway deployment token
- `SNYK_TOKEN`: Your Snyk security token

#### Kafka Configuration (if using)
- `KAFKA_KEY`: Your Kafka API key
- `KAFKA_SECRET`: Your Kafka API secret

### 3. Environment Variables Mapping

The secrets will be automatically mapped to environment variables in your CI/CD pipeline:

```yaml
env:
  TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
  ZAI_API_KEY: ${{ secrets.ZAI_API_KEY }}
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
  STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
  STRIPE_WEBHOOK_SECRET: ${{ secrets.STRIPE_WEBHOOK_SECRET }}
  JSONBIN_API_KEY: ${{ secrets.JSONBIN_API_KEY }}
  RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
  SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  KAFKA_KEY: ${{ secrets.KAFKA_KEY }}
  KAFKA_SECRET: ${{ secrets.KAFKA_SECRET }}
```

### 4. Verification

After setting up the secrets:
1. Trigger a new workflow run
2. Check the workflow logs to ensure secrets are properly loaded
3. Verify that the application starts without missing environment variable errors

### 5. Security Best Practices

- Never commit actual secret values to the repository
- Rotate secrets regularly
- Use different secrets for different environments (staging/production)
- Monitor secret usage in GitHub security alerts
- Use GitHub's secret scanning feature to detect accidentally committed secrets

## Dependabot Configuration

Dependabot has been configured in `.github/dependabot.yml` to automatically update dependencies weekly on Mondays at 9:00 AM UTC.

### Monitoring Updates

- Check the "Pull requests" tab for Dependabot PRs
- Review and test dependency updates before merging
- Configure branch protection rules for automated testing

## Security Features Implemented

✅ **GitHub Secrets**: All sensitive environment variables are stored as GitHub secrets
✅ **Dependabot**: Automatic dependency updates enabled
✅ **Rate Limiting**: Active in backend with 100 requests per 15 minutes for general routes, 50 for API routes
✅ **No Hardcoded Secrets**: All secrets are properly referenced via environment variables
✅ **Vulnerability Scanning**: npm audit run and critical vulnerabilities addressed