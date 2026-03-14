# -----------------------------
# Stage 1: Dependencies
# -----------------------------
FROM oven/bun:latest AS deps

WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile 2>/dev/null || bun install

# -----------------------------
# Stage 2: Builder
# -----------------------------
FROM oven/bun:latest AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the Next.js app
RUN bun run build

# -----------------------------
# Stage 3: Runner (Production)
# -----------------------------
FROM oven/bun:latest AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package.json for reference
COPY package.json ./

# Copy node_modules
COPY --from=deps /app/node_modules ./node_modules

# Copy built app from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose port 3000
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD bun run -e "fetch('http://localhost:3000').then(() => process.exit(0)).catch(() => process.exit(1))" || exit 1

# Start the Next.js app
CMD ["bun", "run", "start"]