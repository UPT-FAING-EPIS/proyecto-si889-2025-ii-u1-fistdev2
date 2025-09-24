# DevFlow Backend - Dockerfile multistage
FROM node:18-slim AS base

# Instalar dependencias del sistema necesarias
RUN apt-get update && apt-get install -y \
    curl \
    openssl \
    libssl3 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Stage para dependencias de producción
FROM base AS deps
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

# Stage para build
FROM base AS builder
COPY . .
RUN npm install --legacy-peer-deps
RUN npm run prisma:generate || echo "Prisma generate skipped"
RUN npm run build

# Stage de producción
FROM node:18-slim AS production
WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    curl \
    openssl \
    libssl3 \
    ca-certificates \
    bash \
    && rm -rf /var/lib/apt/lists/*

# Crear usuario no-root para seguridad
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 --gid nodejs nestjs

# Copiar archivos necesarios
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/seed-users.js ./seed-users.js
COPY --from=builder /app/check-users.js ./check-users.js

# Generar cliente de Prisma en producción
RUN npx prisma generate

# Crear script de inicialización
RUN echo '#!/bin/bash\n\
echo "🚀 Iniciando DevFlow Backend..."\n\
echo "⏳ Esperando base de datos..."\n\
sleep 10\n\
echo "🔄 Ejecutando migraciones..."\n\
npx prisma migrate deploy || echo "⚠️ Migraciones fallaron o no hay cambios"\n\
echo "🌱 Ejecutando seed de usuarios..."\n\
node seed-users.js || echo "⚠️ Seed falló o usuarios ya existen"\n\
echo "✅ Iniciando aplicación..."\n\
exec node dist/main.js' > /app/start.sh && chmod +x /app/start.sh

# Crear directorios necesarios
RUN mkdir -p uploads logs && chown -R nestjs:nodejs /app

USER nestjs

# Exponer puerto
EXPOSE 3001

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3001/api/v1/health || exit 1

# Comando de inicio
CMD ["bash", "/app/start.sh"]
