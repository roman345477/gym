FROM node:20-alpine

WORKDIR /app

# Install ALL deps (including devDeps for TypeScript build)
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy source and build TypeScript
COPY . .
RUN npm run build

# Expose port
EXPOSE 3001

# Run migrations then start — migrations need DATABASE_URL at runtime, not build time
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/server.js"]
