/**
 * PM2 Ecosystem Configuration for Maya Travel Agent
 * Production-ready process management
 */

module.exports = {
  apps: [
    {
      name: 'maya-bot',
      script: './telegram-bot.js',
      instances: 1,
      exec_mode: 'fork',
      
      // Environment
      env: {
        NODE_ENV: 'development',
        LOG_LEVEL: 'DEBUG'
      },
      env_production: {
        NODE_ENV: 'production',
        LOG_LEVEL: 'INFO'
      },
      
      // Restart behavior
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      restart_delay: 4000,
      
      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Advanced features
      min_uptime: '10s',
      max_restarts: 10,
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Monitoring
      instance_var: 'INSTANCE_ID',
      
      // Graceful shutdown
      wait_ready: true,
      shutdown_with_message: true
    },
    
    // Optional: Health check service
    {
      name: 'maya-health-check',
      script: './health-check-server.js',
      instances: 1,
      exec_mode: 'fork',
      
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      
      autorestart: true,
      watch: false,
      max_memory_restart: '100M'
    }
  ],
  
  // Deployment configuration
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'https://github.com/Moeabdelaziz007/maya-travel-agent.git',
      path: '/var/www/maya-travel-agent',
      'post-deploy': 'cd backend && npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt-get install git'
    },
    
    staging: {
      user: 'deploy',
      host: 'staging-server.com',
      ref: 'origin/develop',
      repo: 'https://github.com/Moeabdelaziz007/maya-travel-agent.git',
      path: '/var/www/maya-travel-agent-staging',
      'post-deploy': 'cd backend && npm install && pm2 reload ecosystem.config.js --env staging'
    }
  }
};
