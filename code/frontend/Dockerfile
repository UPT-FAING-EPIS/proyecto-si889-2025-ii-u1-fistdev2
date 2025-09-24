# DevFlow Frontend - Dockerfile
FROM node:18-alpine AS base

# Instalar dependencias del sistema necesarias para SWC y compilación
RUN apk add --no-cache \
    libc6-compat \
    curl \
    python3 \
    make \
    g++ \
    && ln -sf python3 /usr/bin/python

WORKDIR /app

# Configurar npm para mayor robustez
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 5 && \
    npm config set registry https://registry.npmjs.org/

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./

# Stage para dependencias de producción
FROM base AS deps
# Instalar dependencias de producción con reintentos y configuración robusta
RUN npm ci --omit=dev --include=optional --verbose && \
    npm cache clean --force

# Stage para build
FROM base AS builder

# Definir argumentos de build para variables de entorno
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_APP_VERSION

# Establecer variables de entorno para el build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION

COPY . .
# Instalar todas las dependencias incluyendo dev y opcionales con reintentos
RUN npm ci --include=optional --verbose
# Deshabilitar telemetría de Next.js para builds en CI
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage de producción
FROM node:18-alpine AS production
WORKDIR /app

# Instalar dependencias del sistema para runtime
RUN apk update && apk add --no-cache curl

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar node_modules de producción
COPY --from=deps /app/node_modules ./node_modules

# Copiar archivos construidos
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copiar archivos build desde la etapa builder (standalone incluye todo lo necesario)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Exponer puerto
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Comando de inicio para standalone
CMD ["node", "server.js"]
