module.exports = {
  apps: [
    {
      name: 'docbook-app',
      script: 'src/server.js',
      instances: 1, // Single instance required for SQLite WAL concurrency
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
