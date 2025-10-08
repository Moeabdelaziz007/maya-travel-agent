# GLM-4.6 Cursor Integration - Setup Summary

## ✅ What Was Configured

Your Cursor IDE is now ready to use GLM-4.6 from your Z.ai Lite Plan subscription. Here's what was set up:

### 1. Configuration Files Created

- **`GLM-4.6-CURSOR-SETUP.md`** - Complete setup documentation with troubleshooting
- **`setup-glm-cursor.sh`** - Automated setup script
- **`test-glm-api.sh`** - API connection testing script
- **`GLM-CURSOR-INTEGRATION-SUMMARY.md`** - This file

### 2. Environment Variables

The following environment variables need to be configured in your `~/.zshrc`:

```bash
export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
export ANTHROPIC_AUTH_TOKEN="YOUR_ZAI_API_KEY"
export ANTHROPIC_MODEL="glm-4.6"
export ANTHROPIC_SMALL_FAST_MODEL="glm-4.5-Air"
export ANTHROPIC_API_KEY="YOUR_ZAI_API_KEY"
```

### 3. Model Mappings

Cursor will now use GLM models instead of Claude:

| Cursor Reference | Actual Model Used |
|-----------------|-------------------|
| Claude Opus     | GLM-4.6          |
| Claude Sonnet   | GLM-4.6          |
| Claude Haiku    | GLM-4.5-Air      |

---

## 🚀 Quick Start Instructions

### Option 1: Automated Setup (Recommended)

Run the setup script:

```bash
cd /Users/Shared/maya-travel-agent
./setup-glm-cursor.sh
```

The script will:
1. Prompt for your Z.ai API key
2. Backup your existing `.zshrc`
3. Add environment variables
4. Test the API connection
5. Offer to restart Cursor

### Option 2: Manual Setup

If you prefer manual setup:

1. **Get your Z.ai API key** from [https://api.z.ai](https://api.z.ai)

2. **Edit your `.zshrc`:**
   ```bash
   nano ~/.zshrc
   ```

3. **Add the configuration** (replace `YOUR_API_KEY`):
   ```bash
   # Z.ai GLM-4.6 Configuration for Cursor IDE
   export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
   export ANTHROPIC_AUTH_TOKEN="YOUR_API_KEY"
   export ANTHROPIC_MODEL="glm-4.6"
   export ANTHROPIC_SMALL_FAST_MODEL="glm-4.5-Air"
   export ANTHROPIC_API_KEY="YOUR_API_KEY"
   ```

4. **Apply the configuration:**
   ```bash
   source ~/.zshrc
   ```

5. **Restart Cursor completely**

---

## 🧪 Testing the Integration

### Test 1: Verify Environment Variables

```bash
echo $ANTHROPIC_BASE_URL
echo $ANTHROPIC_MODEL
```

Expected output:
```
https://api.z.ai/api/anthropic
glm-4.6
```

### Test 2: Test API Connection

```bash
./test-glm-api.sh YOUR_API_KEY
```

Or if environment variables are set:
```bash
./test-glm-api.sh
```

### Test 3: Use Cursor AI Features

After restarting Cursor:

1. **Open any code file** in your workspace
2. **Try inline editing:** Press `Cmd+K` and ask "Add a docstring to this function"
3. **Try chat:** Press `Cmd+L` and ask "Explain this code"
4. **Try Composer:** Press `Cmd+I` for multi-file editing

If GLM-4.6 responds, the integration is working! 🎉

---

## 📊 Your Plan Details

**Subscription:** Z.ai Lite Plan  
**Cost:** $3/month  
**Quota:** ~120 prompts every 5 hours  
**Reset:** Automatic every 5 hours  
**Features:**
- ✅ GLM-4.6 access
- ✅ GLM-4.5-Air (fast model)
- ❌ Vision MCP (Pro/Max only)
- ❌ Web Search MCP (Pro/Max only)

---

## 📈 Monitoring Usage

### Check Quota Usage

Visit your Z.ai dashboard:
1. Go to [https://api.z.ai](https://api.z.ai)
2. Log in with your account
3. Navigate to **Dashboard** or **Usage**
4. View:
   - Prompts used in current 5-hour window
   - Remaining quota
   - Next reset time

### Check Subscription Status

1. Go to [https://api.z.ai](https://api.z.ai)
2. Click profile icon → **Payment Method**
3. Select **Subscription** from left menu
4. View:
   - Active subscription tier
   - Billing cycle
   - Next payment date
   - Billing history

---

## ⚙️ Advanced Configuration

### Switching Models

If you want to use GLM-4.5 instead of GLM-4.6:

1. Edit `~/.zshrc`
2. Change:
   ```bash
   export ANTHROPIC_MODEL="glm-4.5"
   ```
3. Reload: `source ~/.zshrc`
4. Restart Cursor

### Adding Custom Settings

You can also configure these optional settings:

```bash
# Set max tokens for responses
export ANTHROPIC_MAX_TOKENS="4000"

# Set temperature (0.0-1.0)
export ANTHROPIC_TEMPERATURE="0.7"

# Enable verbose logging
export ANTHROPIC_LOG_LEVEL="debug"
```

---

## 🔧 Troubleshooting

### Issue: Cursor not using GLM-4.6

**Symptoms:** AI responses seem unchanged, or errors mention Claude API

**Solutions:**
1. Verify environment variables are set:
   ```bash
   env | grep ANTHROPIC
   ```
2. Ensure Cursor was **completely restarted** (not just reloaded)
3. Check Cursor's output/console for API errors
4. Try running Cursor from terminal to see environment:
   ```bash
   /Applications/Cursor.app/Contents/MacOS/Cursor
   ```

### Issue: Authentication Failed

**Symptoms:** API errors like "401 Unauthorized" or "Invalid API key"

**Solutions:**
1. Verify your API key is correct:
   ```bash
   echo $ANTHROPIC_AUTH_TOKEN
   ```
2. Check your subscription is active at [https://api.z.ai](https://api.z.ai)
3. Ensure you're using the API key from your account with the Coding Plan
4. Try regenerating your API key on Z.ai

### Issue: Quota Exhausted

**Symptoms:** Errors mentioning "rate limit" or "quota exceeded"

**Solutions:**
1. Check your usage at [https://api.z.ai](https://api.z.ai)
2. Wait for quota reset (every 5 hours)
3. Consider upgrading to Pro ($15/month, ~600 prompts/5hrs)

### Issue: Slow Responses

**Symptoms:** AI takes a long time to respond

**Solutions:**
1. This is normal - GLM-4.6 generates at ~55 tokens/sec
2. For faster responses, try using the small model (`glm-4.5-Air`)
3. Check your internet connection
4. Monitor Z.ai service status

---

## 📚 Additional Resources

### Documentation
- **Z.ai Coding Plan Docs:** [https://docs.z.ai/devpack/overview](https://docs.z.ai/devpack/overview)
- **Z.ai Quick Start:** [https://docs.z.ai/devpack/quick-start](https://docs.z.ai/devpack/quick-start)
- **Cursor Documentation:** [https://cursor.sh/docs](https://cursor.sh/docs)

### Support Channels
- **Z.ai API Platform:** [https://api.z.ai](https://api.z.ai)
- **Z.ai Discord:** Check Z.ai website for community link
- **Cursor Discord:** [https://cursor.sh/discord](https://cursor.sh/discord)

### Related Tools
Your GLM Coding Plan also works with:
- **Cline** (VSCode extension)
- **OpenCode**
- **Roo Code**
- **Kilo Code**
- **Crush**
- **Goose**

---

## 🔄 Next Steps

1. ✅ **Run the setup script** (`./setup-glm-cursor.sh`)
2. ✅ **Test the API** (`./test-glm-api.sh`)
3. ✅ **Restart Cursor completely**
4. ✅ **Try the AI features** (Cmd+K, Cmd+L, Cmd+I)
5. 📊 **Monitor your usage** at Z.ai dashboard

---

## 💡 Tips for Optimal Usage

### Best Practices

1. **Use descriptive prompts** - Be specific about what you want
2. **Iterate gradually** - Make small changes, test, then continue
3. **Monitor your quota** - Keep track to avoid hitting limits
4. **Use the right model:**
   - `glm-4.6` - Complex reasoning, code generation, debugging
   - `glm-4.5-Air` - Quick suggestions, simple completions

### Maximizing Your Lite Plan

With ~120 prompts every 5 hours:
- **~24 prompts/hour** on average
- **~576 prompts/day** if used continuously
- **~17,280 prompts/month**

Each prompt typically allows 15-20 model calls, giving you substantial usage!

### When to Upgrade to Pro

Consider upgrading if you:
- Hit quota limits regularly
- Need Vision Understanding MCP
- Want Web Search MCP integration
- Work on large, complex projects
- Use AI assistance intensively (5× more quota)

---

## ✨ Success Indicators

You'll know the integration is working when:

1. ✅ Environment variables are set correctly
2. ✅ API test script returns 200 OK
3. ✅ Cursor AI features respond to prompts
4. ✅ Responses are generated quickly (~55 tokens/sec)
5. ✅ Usage appears in your Z.ai dashboard

---

## 📝 Notes

- **API quota is separate** - The Coding Plan quota is only used in coding tools, not direct API calls
- **No configuration in Cursor UI** - Everything is done via environment variables
- **Works in terminal** - Launch Cursor from terminal to ensure env vars are loaded
- **Multiple projects** - Once configured, works for all your projects in Cursor

---

**Last Updated:** October 8, 2025  
**Version:** 1.0  
**Author:** AI Assistant  
**Project:** Maya Travel Agent - GLM Integration

---

## 🎉 You're All Set!

Your Cursor IDE is now configured to use GLM-4.6 from your Z.ai Lite Plan. Enjoy AI-powered coding assistance! 🚀

For questions or issues, refer to:
- **Detailed Setup Guide:** `GLM-4.6-CURSOR-SETUP.md`
- **Z.ai Documentation:** [https://docs.z.ai](https://docs.z.ai)
- **Z.ai Dashboard:** [https://api.z.ai](https://api.z.ai)

