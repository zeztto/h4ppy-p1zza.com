FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Public browser widget identifier; the Turnstile server secret stays runtime-only.
ARG PUBLIC_TURNSTILE_SITE_ID
RUN test -n "$PUBLIC_TURNSTILE_SITE_ID" \
    && VITE_TURNSTILE_SITE_KEY="$PUBLIC_TURNSTILE_SITE_ID" npm run build

FROM node:22-alpine AS runtime
ARG APP_REVISION=local
LABEL org.opencontainers.image.revision="$APP_REVISION"
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/build ./build
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
USER node
EXPOSE 3001
CMD ["node", "build/server/server/index.js"]
