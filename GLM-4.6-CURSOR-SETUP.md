# GLM-4.6 Integration with Cursor IDE

## Overview
This guide helps you integrate GLM-4.6 from your Z.ai Lite Plan subscription with Cursor IDE for AI-powered coding assistance.

## Prerequisites
- ✅ Z.ai Lite Plan subscription (active)
- ✅ Cursor IDE installed
- ✅ Z.ai API key from [https://api.z.ai](https://api.z.ai)

## Configuration Steps

### 1. Get Your Z.ai API Key

1. Log in to [Z.ai API Platform](https://api.z.ai)
2. Navigate to **API Keys** section
3. Copy your existing API key or generate a new one

**Important:** Your GLM Coding Plan quota is automatically tracked by Z.ai when using the API key associated with your subscription.

### 2. Configure Environment Variables

Add the following to your `~/.zshrc` file:

```bash
# Z.ai GLM-4.6 Configuration for Cursor IDE
export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
export ANTHROPIC_AUTH_TOKEN="YOUR_ZAI_API_KEY_HERE"
export ANTHROPIC_MODEL="glm-4.6"
export ANTHROPIC_SMALL_FAST_MODEL="glm-4.5-Air"

# Alternative: Set as ANTHROPIC_API_KEY (some tools use this)
export ANTHROPIC_API_KEY="YOUR_ZAI_API_KEY_HERE"
```

**Replace `YOUR_ZAI_API_KEY_HERE` with your actual Z.ai API key.**

### 3. Apply Configuration

Reload your shell configuration:

```bash
source ~/.zshrc
```

### 4. Restart Cursor IDE

Completely quit and restart Cursor to pick up the new environment variables:

```bash
# Quit Cursor
pkill -9 Cursor

# Or use: Command+Q in Cursor

# Then reopen Cursor from Applications or:
open -a Cursor
```

### 5. Verify Integration

Once Cursor restarts, the AI features should now use GLM-4.6:

- Open any code file in your workspace
- Use Cursor's AI features:
  - **Cmd+K**: Inline code editing
  - **Cmd+L**: Chat with AI
  - **Cmd+I**: Composer mode

- Test with a simple prompt like: "Explain this code" or "Add error handling"

## Usage Limits (Lite Plan)

- **~120 prompts every 5 hours** (~3× Claude Pro usage)
- Quota resets automatically every 5 hours
- Monitor usage at [Z.ai Dashboard](https://api.z.ai)

## Model Mappings

Cursor's internal model references map to GLM as follows:

| Cursor Model | GLM Model |
|-------------|-----------|
| Claude Opus | GLM-4.6 |
| Claude Sonnet | GLM-4.6 |
| Claude Haiku | GLM-4.5-Air |

## Troubleshooting

### Issue: Cursor still using default models

**Solution:**
1. Verify environment variables are set:
   ```bash
   echo $ANTHROPIC_BASE_URL
   echo $ANTHROPIC_AUTH_TOKEN
   ```
2. Ensure Cursor was completely restarted after configuration
3. Check Cursor's terminal output for any API errors

### Issue: API authentication errors

**Solution:**
1. Verify your API key is correct
2. Ensure your GLM Coding Plan subscription is active
3. Check your quota hasn't been exhausted (resets every 5 hours)

### Issue: Model not responding

**Solution:**
1. Test API connectivity:
   ```bash
   curl -X POST https://api.z.ai/api/anthropic/v1/messages \
     -H "x-api-key: YOUR_API_KEY" \
     -H "anthropic-version: 2023-06-01" \
     -H "content-type: application/json" \
     -d '{
       "model": "glm-4.6",
       "max_tokens": 100,
       "messages": [{"role": "user", "content": "Hello"}]
     }'
   ```

## Advanced Configuration

### Alternative Configuration via Cursor Settings

If environment variables don't work, you can try configuring via Cursor's settings UI:

1. Open Cursor Settings (**Cmd+,**)
2. Search for "API" or "Model"
3. Look for custom endpoint configuration options
4. Set:
   - **Base URL:** `https://api.z.ai/api/anthropic`
   - **API Key:** Your Z.ai API key
   - **Model:** `glm-4.6`

## Monitoring Usage

### Check Current Quota
Visit your [Z.ai Dashboard](https://api.z.ai) to monitor:
- Prompts used in current 5-hour window
- Remaining quota
- Next reset time

### Billing History
1. Log in to [Z.ai API Platform](https://api.z.ai)
2. Profile Icon → **Payment Method**
3. Select **Subscription** from left menu
4. View usage and billing history

## Notes

- **No MCP Servers** available on Lite Plan (Pro/Max only)
- **Web Search MCP** requires Pro or Max plan upgrade
- **Vision Understanding MCP** requires Pro or Max plan upgrade
- API calls are billed separately from Coding Plan quota

## Support

For issues with:
- **Z.ai API/Subscription:** Contact Z.ai support at [api.z.ai](https://api.z.ai)
- **Cursor IDE:** Check [Cursor documentation](https://cursor.sh/docs)

---

**Last Updated:** October 8, 2025  
**Z.ai Documentation:** [https://docs.z.ai/devpack/overview](https://docs.z.ai/devpack/overview)

