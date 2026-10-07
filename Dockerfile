# DocBook Production Container
# Base Image: Node.js 22 LTS on Alpine Linux
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Set production environment flags
ENV NODE_ENV=production \
    PORT=3000

# Install build dependencies for native compilation if required
RUN apk add --no-cache curl wget

# Copy package files first for cached dependency layer
COPY package.json package-lock.json ./

# Install dependencies (production only)
RUN npm ci --omit=dev

# Copy application source code and public assets
COPY . .

# Ensure data directory exists with write permissions for SQLite database
RUN mkdir -p /app/data && chmod -R 777 /app/data

# Expose HTTP port
EXPOSE 3000

# Container Healthcheck targeting DocBook health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start DocBook application
CMD ["npm", "start"]
