# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/.output ./.output

# Expose port
EXPOSE 3005

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=3005
ENV NODE_ENV=production

# Start application
CMD ["node", ".output/server/index.mjs"]
