# 🚀 DocBook — Production Deployment & Migration Guide

This guide covers deploying DocBook in a production environment using PM2, Docker, or systemd, setting up an Nginx reverse proxy with SSL, and migrating from SQLite to PostgreSQL.

---

## 1. Environment Configuration

Create a production `.env` file based on `.env.example`:

```bash
PORT=3000
NODE_ENV=production
JWT_SECRET=generate_a_random_64_character_hex_secret_here
JWT_EXPIRES_IN=7d
DATABASE_URL=./data/docbook.db
CLINIC_NAME="DocBook Health Center"
CLINIC_CITY="Dhaka"
CLINIC_PHONE="+8801700000000"
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=200
SLOT_HOLD_MINUTES=5
```

---

## 2. Deployment with PM2 (Recommended for VPS / Bare Metal)

PM2 is a production process manager for Node.js with built-in clustering, log management, and auto-restart.

### Step 1: Install PM2 Globally
```bash
npm install -g pm2
```

### Step 2: Create `ecosystem.config.cjs`
```javascript
module.exports = {
  apps: [
    {
      name: 'docbook-app',
      script: 'src/server.js',
      instances: 1, // Note: SQLite runs in single instance with WAL mode
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
```

### Step 3: Initialize Database & Start
```bash
npm run db:init
npm run db:seed
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup
```

---

## 3. Nginx Reverse Proxy with HTTPS (SSL)

Configure Nginx as a reverse proxy in front of DocBook on port 3000:

```nginx
server {
    listen 80;
    server_name docbook.health www.docbook.health;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name docbook.health www.docbook.health;

    ssl_certificate /etc/letsencrypt/live/docbook.health/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/docbook.health/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 4. Docker Deployment

### `Dockerfile`
```dockerfile
FROM node:26-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "src/server.js"]
```

### `docker-compose.yml`
```yaml
version: '3.8'

services:
  docbook:
    build: .
    restart: always
    ports:
      - "3000:3000"
    volumes:
      - docbook-data:/app/data
    environment:
      - NODE_ENV=production
      - PORT=3000
      - JWT_SECRET=change_this_to_a_secure_random_key_in_production
      - DATABASE_URL=/app/data/docbook.db

volumes:
  docbook-data:
```

---

## 5. PostgreSQL Migration Guide

DocBook was built with standard ANSI SQL data types and syntax to make migrating from SQLite to PostgreSQL straightforward:

1. **Install PostgreSQL Client Driver:**
   ```bash
   npm install pg
   ```

2. **Schema Equivalencies:**
   - `INTEGER PRIMARY KEY AUTOINCREMENT` ➡️ `SERIAL PRIMARY KEY` or `INT GENERATED ALWAYS AS IDENTITY`.
   - `CURRENT_TIMESTAMP` ➡️ `CURRENT_TIMESTAMP`.
   - `datetime('now')` ➡️ `NOW()`.
   - Parameter placeholders: replace `?` with `$1, $2, ...` or use a query builder / adapter like Kysely or Prisma.

3. **Transaction Management:**
   - In SQLite: `BEGIN IMMEDIATE` / `COMMIT`.
   - In PostgreSQL: `BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED` (or `REPEATABLE READ`).
   - The slot reservation CAS statement works identically:
     ```sql
     UPDATE time_slots
     SET status = 'HELD',
         held_by_user_id = $1,
         held_until = NOW() + INTERVAL '5 minutes'
     WHERE id = $2 
       AND (status = 'AVAILABLE' OR (status = 'HELD' AND held_until < NOW()));
     ```

4. **Clustering & Horizontal Scaling:**
   Once running on PostgreSQL, multiple Node.js worker instances can run in parallel behind a load balancer (`instances: 'max'` in PM2) because row-level locking is handled cleanly by PostgreSQL.
