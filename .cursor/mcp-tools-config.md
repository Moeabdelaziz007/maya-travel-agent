# Cursor MCP Tools Configuration

## Current MCP Servers Configured

### 🚀 Deployment & Hosting

- **Vercel**: Frontend deployment and domain management
- **Railway**: Backend deployment and database hosting

### 💾 Database & Storage

- **Supabase**: PostgreSQL database, authentication, real-time subscriptions
- **SQLite**: Local development database

### 🔧 Development Tools

- **GitHub**: Repository management, CI/CD pipelines
- **Filesystem**: Local file operations and management
- **Git**: Version control operations

### 💰 Business Tools

- **Stripe**: Payment processing, subscriptions, webhooks
- **Telegram**: Bot management, mini app integration

## Usage in Cursor

### Available Commands

Once configured, you can use natural language commands like:

**Deployment:**

```
Deploy the frontend to Vercel
Check Railway deployment status
```

**Database:**

```
Create a new Supabase table for user_sessions
Query Supabase for recent trips
```

**Git Operations:**

```
Create a new branch for payment-integration
Commit all changes with message "Add Stripe webhooks"
Push to GitHub and create PR
```

**File Operations:**

```
Create a new component file for BudgetTracker
Find all files containing "maya" (needs updating)
```

**Payments:**

```
Create a new Stripe payment intent
Check webhook delivery status
```

## Configuration Notes

### Environment Variables Needed

```bash
# Supabase
SUPABASE_ACCESS_TOKEN=your_token

# Stripe
STRIPE_SECRET_KEY=your_key

# Telegram
TELEGRAM_BOT_TOKEN=your_token

# GitHub
GITHUB_PERSONAL_ACCESS_TOKEN=your_token
```

### Setup Instructions

1. **Vercel MCP**: Get team slug from Vercel dashboard
2. **Supabase MCP**: Generate access token in Supabase dashboard
3. **Stripe MCP**: Use restricted API key for MCP operations
4. **GitHub MCP**: Create personal access token with repo permissions

## MCP Server URLs

| Service    | MCP URL                  | Status        |
| ---------- | ------------------------ | ------------- |
| Vercel     | https://mcp.vercel.com   | ✅ Configured |
| Railway    | https://mcp.railway.app  | ✅ Configured |
| Supabase   | https://mcp.supabase.com | ✅ Configured |
| GitHub     | https://mcp.github.com   | ✅ Configured |
| Stripe     | https://mcp.stripe.com   | ✅ Configured |
| Telegram   | https://mcp.telegram.org | ✅ Configured |
| Filesystem | Local MCP server         | ✅ Configured |
| Git        | Local MCP server         | ✅ Configured |
| SQLite     | Local MCP server         | ✅ Configured |

## Troubleshooting

### MCP Server Not Connecting

1. Check if the service has MCP support
2. Verify your API keys/tokens are valid
3. Restart Cursor to reload MCP configuration

### Commands Not Working

1. Try rephrasing the command
2. Use more specific language
3. Check service-specific documentation

### Local MCP Servers

For filesystem, git, and sqlite MCP servers:

```bash
# Install MCP servers globally
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-git
npm install -g @modelcontextprotocol/server-sqlite
```

## Security Best Practices

- Use restricted API keys with minimal permissions
- Regularly rotate access tokens
- Monitor MCP server usage in service dashboards
- Never commit API keys to version control

---

**Last Updated:** October 11, 2025
