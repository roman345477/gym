FROM node:20-alpine

# Required for Prisma schema engine on Alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Install all deps (including devDeps for TypeScript build)
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy source and build TypeScript
COPY . .
RUN npm run build

EXPOSE 3001

# Push schema to DB then start server
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/server.js"]
