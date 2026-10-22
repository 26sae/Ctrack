# ---- Build stage: bundle the Vite frontend ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines env vars at build time, so these must be build args (not runtime env).
ARG VITE_API_BASE_URL=""
ARG VITE_GOOGLE_MAPS_API_KEY=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY

RUN npm run build

# ---- Runtime stage: Express API + static frontend ----
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=5000 \
    MYSQL_SSL_CA_PATH=/app/ca.pem

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY server ./server
COPY ca.pem ./ca.pem
COPY --from=build /app/dist ./dist

USER node
EXPOSE 5000

# Consider the container up whenever the server answers, even if the DB is briefly down.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get({host:'127.0.0.1',port:process.env.PORT||5000,path:'/api/health'},()=>process.exit(0)).on('error',()=>process.exit(1))"

CMD ["node", "server/index.js"]
