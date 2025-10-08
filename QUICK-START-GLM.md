# GLM-4.6 Quick Start Guide

## 🚀 3-Step Setup

### Step 1: Run Setup Script
```bash
cd /Users/Shared/maya-travel-agent
./setup-glm-cursor.sh
```

### Step 2: Enter Your API Key
- Get it from: [https://api.z.ai](https://api.z.ai)
- Paste when prompted

### Step 3: Restart Cursor
- Quit Cursor completely (Cmd+Q)
- Reopen from Applications

---

## ✅ Verify It's Working

### Test Environment
```bash
echo $ANTHROPIC_MODEL
# Should output: glm-4.6
```

### Test API
```bash
./test-glm-api.sh
# Should show: Connection successful!
```

### Test in Cursor
- Open any code file
- Press **Cmd+K** → Type: "Add a comment"
- If GLM-4.6 responds → ✅ Working!

---

## 📊 Quick Reference

| Feature | Shortcut | Description |
|---------|----------|-------------|
| Inline Edit | `Cmd+K` | Edit code inline |
| AI Chat | `Cmd+L` | Chat with GLM-4.6 |
| Composer | `Cmd+I` | Multi-file editing |

| Plan | Quota | Price |
|------|-------|-------|
| Lite | ~120 prompts/5hrs | $3/month |

---

## 🔗 Important Links

- **Dashboard:** [api.z.ai](https://api.z.ai)
- **Documentation:** [docs.z.ai](https://docs.z.ai/devpack/overview)
- **Detailed Setup:** `GLM-4.6-CURSOR-SETUP.md`
- **Full Summary:** `GLM-CURSOR-INTEGRATION-SUMMARY.md`

---

## ⚠️ Troubleshooting

**Not working?**
1. Verify: `env | grep ANTHROPIC`
2. Restart Cursor completely
3. Run: `./test-glm-api.sh`
4. Check: [api.z.ai](https://api.z.ai) (quota/subscription)

---

**Need help?** See `GLM-4.6-CURSOR-SETUP.md` for detailed troubleshooting.

