module.exports = {
  apps: [
    {
      name: "wa-akg",
      script: "npx",
      args: "tsx src/server/index.ts",
      interpreter: "none", // Avoid PM2 trying to run npx as a Node.js script directly
      watch: false,
      autorestart: true,
      restart_delay: 8000,              // Wait at least 8s before trying to restart
      exp_backoff_restart_delay: 15000, // Double backoff time on repeated failures
      max_restarts: 5,                  // Hard stop after 5 failed reconnects to avoid Meta auth spam
      max_memory_restart: "1G",
      exec_mode: "fork",
      env: {
        NODE_ENV: "production"
      },
      env_production: {
        NODE_ENV: "production"
      },
      error_file: "logs/pm2-error.log",
      out_file: "logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
};
