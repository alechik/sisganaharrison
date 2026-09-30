# ============================================================
# DOCKERFILE - FRONTEND REACT 19 (VITE + NGINX)
# ============================================================
# Estrategia: Multi-stage build
#
# Stage 1: Construcción (Build Stage)
#   - Node.js 20 para compilar React con Vite
#   - Instala dependencias npm
#   - Genera el bundle de producción en /app/dist
#
# Stage 2: Imagen final (Production Stage)
#   - Nginx Alpine (imagen ligera ~25MB)
#   - Sirve únicamente los archivos estáticos generados
#   - No incluye Node.js ni dependencias de build
# ============================================================

# ============================================================
# STAGE 1: BUILD DEL FRONTEND CON NODE.JS
# ============================================================
# Usamos Node.js 20 (LTS) para compilar el proyecto Vite + React.
# La versión Alpine no se usa aquí porque algunas dependencias
# nativas pueden fallar; la imagen Bookworm es más compatible.
# ============================================================
FROM node:20-bookworm AS build_frontend

# ---------- METADATOS ----------
LABEL description="Build stage - Frontend SisGanaderia React + Vite"

# ---------- DIRECTORIO DE TRABAJO ----------
WORKDIR /app

# ---------- VARIABLES DE ENTORNO PARA BUILD ----------
# Vite requiere que las variables que se usarán en el código
# cliente tengan el prefijo VITE_. Estas variables se "queman"
# dentro del bundle en tiempo de build (no son runtime).
# Si no se definen, quedarán como cadena vacía.
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}

ARG VITE_APP_NAME="SisGanaderia"
ENV VITE_APP_NAME=${VITE_APP_NAME}

# ---------- COPIAR DEPENDENCIAS PARA CACHÉ ----------
# Copiamos primero package.json y package-lock.json para
# aprovechar la caché de Docker. Si estos archivos no cambian,
# Docker reutilizará la capa con node_modules.
COPY package.json package-lock.json ./

# Instalamos dependencias:
# --ignore-scripts: Evita scripts de postinstall peligrosos
# --no-audit: Omite auditoría de seguridad (acelera el build)
# --no-fund: Omite mensaje de donaciones
RUN npm ci \
    --ignore-scripts \
    --no-audit \
    --no-fund

# ---------- COPIAR CÓDIGO FUENTE ----------
# Copiamos TODO el resto del código del frontend
COPY . /app/

# ---------- EJECUTAR BUILD DE PRODUCCIÓN ----------
# Este comando:
#   1. Compila TypeScript (tsc -b)
#   2. Genera bundle optimizado con Vite
#   3. Deja los archivos listos en /app/dist/
RUN npm run build

# ============================================================
# STAGE 2: IMAGEN FINAL CON NGINX (ALPINE)
# ============================================================
# Nginx es el servidor web más eficiente para servir contenido
# estático. La versión Alpine es mínima y muy segura.
# ============================================================
FROM nginx:1.27-alpine AS frontend

# ---------- METADATOS DE LA IMAGEN ----------
LABEL maintainer="SisGanaderia"
LABEL description="Frontend React 19 - Sistema de gestión ganadera"
LABEL version="1.0.0"

# ---------- INSTALAR HERRAMIENTAS ÚTILES ----------
# Instalamos curl para healthchecks de Docker
RUN apk add --no-cache curl tzdata

# ---------- CONFIGURAR ZONA HORARIA ----------
ENV TZ=America/Mexico_City
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# ---------- REMOVER CONFIGURACIÓN POR DEFECTO DE NGINX ----------
# Borramos el sitio default para no dejar servidores virtuales basura
RUN rm /etc/nginx/conf.d/default.conf

# ---------- COPIAR NUESTRA CONFIGURACIÓN DE NGINX ----------
# Configuración personalizada para servir SPA (React Router)
# y optimizar rendimiento (gzip, caché de assets, etc.)
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# ---------- CREAR USUARIO NO ROOT ----------
# Nginx ya viene con el usuario nginx, pero nos aseguramos
# de que exista y de establecer los permisos correctos
RUN adduser -D -u 1000 -s /sbin/nologin -h /var/cache/nginx appuser \
    && chown -R appuser:appuser /var/cache/nginx \
    && chown -R appuser:appuser /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown appuser:appuser /var/run/nginx.pid

# ---------- COPIAR ARCHIVOS ESTÁTICOS DESDE EL BUILD ----------
# Copiamos el /dist generado en el Stage 1 al directorio
# que usará Nginx para servir el sitio.
COPY --from=build_frontend --chown=appuser:appuser /app/dist /usr/share/nginx/html

# ---------- PERMISOS EN DIRECTORIOS ----------
RUN chown -R appuser:appuser /usr/share/nginx/html \
    && chmod -R 755 /usr/share/nginx/html

# ---------- PUERTO EXPUESTO ----------
# Puerto HTTP en el que Nginx escuchará peticiones
EXPOSE 8080

# ---------- DIRECTORIO DE TRABAJO ----------
WORKDIR /usr/share/nginx/html

# ---------- USUARIO NO ROOT ----------
USER appuser

# ---------- HEALTHCHECK ----------
# Docker verificará cada 30s que la aplicación responde correctamente
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -fsS http://localhost:8080/ || exit 1

# ---------- INICIAR NGINX ----------
# "daemon off" hace que Nginx se ejecute en primer plano,
# lo cual es obligatorio en contenedores Docker.
CMD ["nginx", "-g", "daemon off;"]
