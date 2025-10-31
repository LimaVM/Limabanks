module.exports = {
  apps: [
    {
      name: "limabank",
      script: "server.js",
      cwd: "/var/www/limabank",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "800M",
      env: {
        NODE_ENV: "production",
        NODE_OPTIONS: "--max-old-space-size=768",
      },
      error_file: "/var/log/pm2/limabank-error.log",
      out_file: "/var/log/pm2/limabank-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      time: true,
    },
  ],
}
