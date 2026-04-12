# Stage 1 — Install dependencies (layer cache)
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2 — Build Vite production bundle
FROM deps AS build
COPY . .
RUN npm run build

# Stage 3 — Production runtime
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm install --no-save tsx && rm -rf ~/.npm

COPY --from=build /app/dist ./dist
COPY server/ ./server/

USER node
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "--import", "tsx", "server/index.ts"]
