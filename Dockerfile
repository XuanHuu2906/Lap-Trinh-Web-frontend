# Stage 1: base — shared dependencies layer (no target)
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

# Stage 2: dev — Vite dev server with HMR (target: dev)
# NOTE: src/ is NOT copied — it's bind-mounted via docker-compose.dev.yml.
# Do NOT run this stage standalone without manually mounting src/.
FROM base AS dev
RUN npm ci
COPY index.html ./
COPY public ./public
COPY vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY eslint.config.js ./
EXPOSE 5173
CMD ["npx", "vite", "--host", "0.0.0.0"]

# Stage 3: builder — compile + bundle (internal)
# Vite tự load .env.production khi `vite build` (chứa SUPABASE keys).
# VITE_API_URL được override qua build arg để compose có thể dùng `/api` (nginx proxy)
# trong khi deploy Render giữ nguyên URL cloud từ .env.production.
FROM base AS builder
RUN npm ci
COPY src ./src
COPY public ./public
COPY index.html ./
COPY tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts ./
COPY .env.production ./
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 4: production — nginx serving static (target: production)
FROM nginx:alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
