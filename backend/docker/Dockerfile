# ---- builder ----
    FROM node:20-alpine AS builder
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci
    COPY . .
    RUN npx prisma generate
    RUN npm run build
    
    # ---- runner ----
    FROM node:20-alpine AS runner
    WORKDIR /app
    ENV NODE_ENV=production
    COPY package*.json ./
    RUN npm ci --omit=dev
    COPY --from=builder /app/dist ./dist
    COPY --from=builder /app/prisma ./prisma
    COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
    COPY docker/entrypoint.sh /entrypoint.sh
    RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs && chmod +x /entrypoint.sh
    USER nodeuser
    EXPOSE 3000
    ENTRYPOINT ["/entrypoint.sh"]
    CMD ["node", "src/server.ts"]
    