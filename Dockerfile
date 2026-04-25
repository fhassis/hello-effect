# --- BASE STAGE: Define the shared environment ---
FROM oven/bun:latest AS base
WORKDIR /app

# --- STAGE 1: Build ---
# Inherit from base to ensure environment consistency
FROM base AS builder

# Copy dependency files first
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy source and bundle
COPY . .
RUN bun build ./src/simple_producer_consumer/index.ts \
    --target bun \
    --outfile ./dist/index.js

# --- STAGE 2: Runtime ---
# Inherit from base again for the final lightweight image
FROM base AS runtime

# Copy only the bundled artifact from the builder
COPY --from=builder /app/dist/index.js .

# Standard production environment variable
ENV NODE_ENV=production

# Run the bundled application
CMD ["bun", "run", "index.js"]
