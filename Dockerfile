FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ----Depedencies Stages----
FROM base AS deps
RUN npm install --only=production

#-----Build Stage------
FROM base AS builder
RUN npm install
COPY . .
RUN npm run build

# ----Runner Stage-----
FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]
