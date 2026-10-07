# Production Dockerfile for DocBook
FROM node:22-alpine AS runner

WORKDIR /app

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache tzdata

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy package descriptors first for Docker layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy application source code and static assets
COPY . .

# Ensure data directory exists with write permissions
RUN mkdir -p /app/data /app/data/backups

# Expose default HTTP port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start server
CMD ["node", "src/server.js"]
