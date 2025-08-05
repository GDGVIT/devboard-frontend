# DevBoard Frontend Dockerfile
# Build a production-ready container for Next.js frontend

FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN yarn install --frozen-lockfile || npm install

# Copy source code
COPY . .

# Build Next.js app
RUN yarn build || npm run build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Install only production dependencies
RUN yarn install --production --frozen-lockfile || npm install --production

# Set environment variables (override in deployment)
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start Next.js server
CMD ["yarn", "start"]
