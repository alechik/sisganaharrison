# ============================================================
# DOCKERFILE - APP MOVIL (FLUTTER WEB)
# ============================================================
# Compila el cliente Flutter a web y lo sirve con Nginx.
# Es un contenedor independiente: no modifica ni reemplaza los
# servicios postgres/backend/frontend/nginx del sistema principal.
# ============================================================

# ---------- ETAPA 1: COMPILACION FLUTTER ----------
FROM ghcr.io/cirruslabs/flutter:3.44.0 AS build

WORKDIR /app

# Cacheamos dependencias antes de copiar el codigo fuente.
COPY pubspec.yaml pubspec.lock ./
RUN flutter pub get

COPY . .
RUN flutter build web --release --no-wasm-dry-run

# ---------- ETAPA 2: SERVIDOR ESTATICO ----------
FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build/web /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=10s \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
