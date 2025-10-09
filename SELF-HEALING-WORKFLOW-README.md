# 🔧 Maya Travel Agent - Self-Healing Workflow System

## Overview

The Self-Healing Workflow System is an automated monitoring and recovery solution designed specifically for the Maya Travel Agent project. It continuously monitors the development environment, detects issues, diagnoses problems, and automatically applies fixes to maintain optimal system health.

## 🚀 Features

- **Continuous Health Monitoring**: Automatically checks system status every 30 seconds
- **Intelligent Issue Detection**: Identifies missing files, service failures, and error patterns
- **Automated Diagnosis**: Uses a knowledge base to diagnose issues and determine root causes
- **Smart Fix Application**: Automatically applies appropriate fixes based on issue diagnosis
- **Real-time Dashboard**: Web-based monitoring interface with live status updates
- **Comprehensive Logging**: Detailed activity logs for troubleshooting and analysis
- **Local Development Support**: Works without Docker, perfect for development environments

## 📋 Prerequisites

- Node.js 18+
- Python 3.11+
- Maya Travel Agent project setup

## 🛠️ Quick Start

### 1. Setup Local Development Environment

```bash
# Run the setup script to configure your environment
./setup-local-dev.sh
```

This script will:
- Check Node.js and Python versions
- Create Python virtual environment
- Install all dependencies
- Set up environment files
- Create necessary directories

### 2. Start All Services

```bash
# Start frontend, backend, and monitoring systems
./start-all.sh
```

Or start services individually:

```bash
# Frontend only
./start-frontend.sh

# Backend only
./start-backend.sh
```

### 3. Launch Self-Healing Workflow

```bash
# Start continuous monitoring
node self-healing-workflow.js start

# Run one-time health check
node self-healing-workflow.js check

# Check current status
node self-healing-workflow.js status

# Stop monitoring
node self-healing-workflow.js stop
```

### 4. Open Monitoring Dashboard

Open `monitoring-dashboard.html` in your browser to access the real-time dashboard.

## 📊 Monitoring Dashboard

The dashboard provides a visual interface for monitoring system health:

### Dashboard Features

- **System Status Card**: Overall system health indicator
- **Self-Healing Engine Card**: Monitoring status and auto-fix counter
- **Service Health Card**: Individual service status (Frontend, Backend, AI Tools)
- **Activity Logs**: Real-time log streaming with color-coded severity levels

### Dashboard Controls

- **▶️ Start Monitoring**: Begin continuous health monitoring
- **🔍 Health Check**: Run manual system health check
- **⏹️ Stop Monitoring**: Halt the self-healing workflow

## 🔧 How It Works

### 1. Health Monitoring Cycle

Every 30 seconds, the system performs comprehensive health checks:

```javascript
// System health checks include:
- Required file existence (package.json, requirements.txt, .env files)
- Service responsiveness (HTTP health endpoints)
- Log file error pattern scanning
- Dependency and environment validation
```

### 2. Issue Detection & Diagnosis

When issues are detected, the system:

1. **Identifies the Issue Type**: Categorizes problems (missing files, service down, errors)
2. **Matches Against Knowledge Base**: Uses predefined patterns to diagnose root causes
3. **Calculates Confidence**: Provides confidence levels for diagnoses
4. **Suggests Solutions**: Recommends appropriate fix strategies

### 3. Automated Fix Application

The system can automatically apply various fixes:

- **Dependency Issues**: Clear npm cache, reinstall packages
- **Service Failures**: Restart services, check configurations
- **Environment Problems**: Validate versions, check paths
- **File Missing**: Create required files or prompt for setup

## 📁 File Structure

```
maya-travel-agent/
├── self-healing-workflow.js      # Main workflow engine
├── monitoring-dashboard.html     # Web dashboard
├── setup-local-dev.sh           # Environment setup script
├── start-frontend.sh            # Frontend startup script
├── start-backend.sh             # Backend startup script
├── start-all.sh                 # Combined startup script
├── logs/                        # Log files directory
│   ├── self-healing.log         # Workflow activity logs
│   ├── frontend.log             # Frontend service logs
│   └── backend.log              # Backend service logs
└── README.md                    # This file
```

## 🔍 Knowledge Base

The system includes a built-in knowledge base of common issues:

### Supported Issue Types

| Issue Type | Symptoms | Auto-Fix Capability |
|------------|----------|-------------------|
| Frontend Build Failed | npm errors, dependency conflicts | ✅ Yes |
| Backend Server Down | Connection refused, port issues | ✅ Yes |
| Database Connection | Timeout, auth failures | ✅ Yes |
| Missing Dependencies | Import errors, module not found | ✅ Yes |
| Environment Issues | Version mismatches, path problems | ⚠️ Partial |

### Adding New Issue Types

To extend the knowledge base, modify the `knowledgeBase` object in `self-healing-workflow.js`:

```javascript
this.knowledgeBase['new_issue_type'] = {
    symptoms: ['error pattern 1', 'error pattern 2'],
    diagnosis: 'Root cause description',
    solutions: [
        'Fix strategy 1',
        'Fix strategy 2'
    ]
};
```

## 📈 Monitoring & Analytics

### Log Analysis

The system automatically scans log files for error patterns:

- **Error Detection**: Regex-based pattern matching
- **Severity Classification**: INFO, WARN, ERROR levels
- **Trend Analysis**: Identifies recurring issues
- **Context Preservation**: Maintains error context for diagnosis

### Performance Metrics

- **Check Frequency**: Configurable monitoring intervals
- **Fix Success Rate**: Tracks automated fix effectiveness
- **System Uptime**: Monitors service availability
- **Response Times**: Tracks health check performance

## 🚨 Troubleshooting

### Common Issues

#### Self-Healing Workflow Won't Start

```bash
# Check if Node.js is available
node --version

# Verify file permissions
ls -la self-healing-workflow.js

# Check for port conflicts
lsof -i :3000,8000,8080
```

#### Dashboard Not Loading

```bash
# Ensure services are running
node self-healing-workflow.js status

# Check if ports are accessible
curl http://localhost:8000/health
```

#### Auto-Fixes Not Working

```bash
# Check log files for errors
tail -f logs/self-healing.log

# Verify script permissions
chmod +x start-*.sh

# Test manual fixes
./start-backend.sh
```

### Manual Recovery Procedures

If automated fixes fail, use these manual procedures:

#### Reset Frontend Dependencies

```bash
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### Reset Backend Environment

```bash
# Recreate virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```

#### Clear All Logs and Restart

```bash
# Stop all services
node self-healing-workflow.js stop
pkill -f "npm run dev"
pkill -f "python app.py"

# Clear logs
rm -rf logs/*

# Restart everything
./start-all.sh
node self-healing-workflow.js start
```

## ⚙️ Configuration

### Environment Variables

Create `.env` files in both frontend and backend directories:

```bash
# Frontend .env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Backend .env
OPENAI_API_KEY=your_openai_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
PORT=8000
```

### Workflow Configuration

Modify `self-healing-workflow.js` to customize:

```javascript
this.config = {
    checkInterval: 30000,  // Health check frequency (ms)
    maxRetries: 3,         // Maximum fix attempts
    logFile: 'logs/self-healing.log',
    services: {
        frontend: { port: 3000, url: 'http://localhost:3000' },
        backend: { port: 8000, url: 'http://localhost:8000' },
        ai_tools: { port: 8080, url: 'http://localhost:8080' }
    }
};
```

## 🔒 Security Considerations

- **Environment Variables**: Never commit API keys to version control
- **Log Security**: Ensure logs don't contain sensitive information
- **Network Access**: Dashboard should only be accessible locally
- **Permission Management**: Run with minimal required permissions

## 📞 Support

### Getting Help

1. **Check Logs**: Review `logs/self-healing.log` for detailed error information
2. **Dashboard Status**: Use the monitoring dashboard for real-time status
3. **Manual Health Check**: Run `node self-healing-workflow.js check` for diagnostics
4. **Community Support**: Check project documentation and issue tracker

### Reporting Issues

When reporting issues, include:

- Self-healing workflow logs (`logs/self-healing.log`)
- Service logs (`logs/frontend.log`, `logs/backend.log`)
- System information (OS, Node.js version, Python version)
- Steps to reproduce the issue
- Dashboard screenshots (if applicable)

## 🎯 Best Practices

### Development Workflow

1. **Always run setup script first**: `./setup-local-dev.sh`
2. **Start services with start-all**: `./start-all.sh`
3. **Enable self-healing**: `node self-healing-workflow.js start`
4. **Monitor via dashboard**: Open `monitoring-dashboard.html`
5. **Check logs regularly**: `tail -f logs/self-healing.log`

### Maintenance

- **Regular log rotation**: Archive old logs to prevent disk space issues
- **Update knowledge base**: Add new issue patterns as they're discovered
- **Monitor fix success**: Track which automated fixes work best
- **Review dashboard**: Regular visual inspection of system health

## 🔄 Continuous Improvement

The self-healing system learns and improves over time:

- **Pattern Recognition**: Identifies new error patterns automatically
- **Fix Optimization**: Tracks success rates of different fix strategies
- **Knowledge Expansion**: Grows the internal knowledge base
- **Performance Tuning**: Optimizes check intervals and resource usage

## 📚 Related Documentation

- [Local Development Setup Guide](./setup-local-dev.sh)
- [Frontend Development Guide](./frontend/README.md)
- [Backend Development Guide](./backend/README.md)
- [Project Overview](./README.md)

---

**Maya Travel Agent** - Intelligent travel planning with AI-powered assistance and self-healing development environment.