// PM2 Ecosystem Configuration
// Production process management for Token Holder Monitor
//
// Usage:
//   pm2 start ecosystem.config.cjs
//   pm2 logs token-holder-monitor
//   pm2 restart token-holder-monitor
//   pm2 stop token-holder-monitor

module.exports = {
  apps: [
    {
      name: 'token-holder-monitor',
      script: './dist/index.js',

      // Environment
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // Process Management
      instances: 1,
      exec_mode: 'fork',

      // Auto-restart on crashes
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',

      // Restart delays
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,

      // Logging
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,

      // Monitoring
      merge_logs: true,

      // Source maps support
      source_map_support: true,

      // Environment variables from .env
      env_file: '.env',
    }
  ],

  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/token-holder-monitor.git',
      path: '/var/www/token-holder-monitor',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.cjs --env production',
    }
  }
};
