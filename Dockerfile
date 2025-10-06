# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files first for better layer caching
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies and unnecessary files to reduce image size
RUN npm ci --only=production && npm cache clean --force && \
    rm -rf src/ tsconfig.json .eslintrc.json

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeapp -u 1001

# Change ownership of the app directory
RUN chown -R nodeapp:nodejs /app
USER nodeapp

# Expose port
EXPOSE 3000

# Health check with better error handling and timeout
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "const http = require('http'); \
  const req = http.get('http://127.0.0.1:3000/health', { timeout: 5000 }, (res) => { \
    if (res.statusCode === 200) { \
      console.log('Health check passed'); \
      process.exit(0); \
    } else { \
      console.log('Health check failed with status:', res.statusCode); \
      process.exit(1); \
    } \
  }); \
  req.on('error', (err) => { \
    console.log('Health check error:', err.message); \
    process.exit(1); \
  }); \
  req.on('timeout', () => { \
    console.log('Health check timeout'); \
    req.destroy(); \
    process.exit(1); \
  });"

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application with proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
