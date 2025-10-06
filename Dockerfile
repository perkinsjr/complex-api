# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm ci --only=production && npm cache clean --force

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeapp -u 1001

# Change ownership of the app directory
RUN chown -R nodeapp:nodejs /app
USER nodeapp

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { \
    if (res.statusCode === 200) { \
      process.exit(0); \
    } else { \
      process.exit(1); \
    } \
  }).on('error', () => process.exit(1));"

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
