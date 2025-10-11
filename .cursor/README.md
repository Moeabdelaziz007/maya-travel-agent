# Cursor MCP Configuration

This directory contains MCP (Model Context Protocol) server configurations for Cursor.

## Vercel MCP Setup

We've configured two Vercel MCP connections:

### 1. General Vercel Access (`vercel`)
- **URL**: `https://mcp.vercel.com`
- **Use**: Access all Vercel projects, search documentation, manage deployments across teams

### 2. Project-Specific Access (`vercel-amrikyy`)
- **URL**: `https://mcp.vercel.com/YOUR_TEAM_SLUG/amrikyy-travel-agent`
- **Use**: Direct access to the Amrikyy Travel Agent project with automatic context
- **Benefits**:
  - No need to manually specify project/team slugs
  - Faster tool execution
  - Better error handling
  - Streamlined deployment management

## Setup Instructions

1. **Find Your Team Slug**:
   ```bash
   # Using Vercel CLI
   vercel projects ls
   
   # Or visit: https://vercel.com/dashboard → Settings → General
   ```

2. **Update mcp.json**:
   - Replace `YOUR_TEAM_SLUG` with your actual team slug in `mcp.json`
   - Example: If your team is "acme-corp", change to:
     `https://mcp.vercel.com/acme-corp/amrikyy-travel-agent`

3. **Authorize in Cursor**:
   - Cursor will show "Needs login" prompt for Vercel MCP
   - Click the prompt to authorize
   - Sign in with your Vercel account

## Available Tools

Once authorized, you can ask Cursor to:

- **Deployments**: 
  - "Show my latest deployments"
  - "Check deployment logs for [deployment-url]"
  - "Redeploy the latest version"

- **Documentation**: 
  - "Search Vercel docs for serverless functions"
  - "How do I configure environment variables?"

- **Project Management**:
  - "List all my Vercel projects"
  - "Show project settings"

- **Analytics**:
  - "Get deployment performance metrics"

## Security Notes

- Vercel MCP grants the same access as your Vercel user account
- Always verify you're connecting to `https://mcp.vercel.com`
- Enable human confirmation for destructive operations
- Review permissions before authorizing

## Troubleshooting

**"Project slug and Team slug are required" error**:
- Use the project-specific URL (`vercel-amrikyy`) instead of general `vercel`

**Connection issues**:
- Restart Cursor
- Check if authorization token expired (re-authorize)
- Verify your Vercel account has access to the project

For more details: https://vercel.com/docs/mcp/vercel-mcp
