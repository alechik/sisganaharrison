# ============================================================
# DOCKERFILE - BACKEND LARAVEL 12 (PHP 8.2 + FPM)
# ============================================================
# Estrategia: Multi-stage build para reducir el tamaño final
# de la imagen y asegurar un entorno limpio para producción.
#
# Stage 1: Descarga e instalación de dependencias Composer
# Stage 2: Imagen final optimizada para producción
# ============================================================

# ============================================================
# STAGE 1: COMPOSER DEPENDENCIES
# ============================================================
# Instalamos las dependencias de PHP en una etapa separada
# para aprovechar la caché de Docker y no incluir Composer
# en la imagen final de producción.
# ============================================================
FROM composer:2.8 AS composer_deps

# Establecemos directorio de trabajo
WORKDIR /app

# Copiamos primero sólo los archivos de Composer para cachear
# la capa de dependencias si composer.json/composer.lock no cambian
COPY composer.json composer.lock ./

# Instalamos dependencias de producción:
# --no-dev: sin dependencias de desarrollo
# --prefer-dist: usa versiones empaquetadas (más rápido)
# --optimize-autoloader: optimiza el autoloader para producción
# --no-interaction: modo no interactivo
RUN composer install \
    --no-dev \
    --prefer-dist \
    --optimize-autoloader \
    --no-interaction \
    --no-scripts

# ============================================================
# STAGE 2: IMPAGEN FINAL - PHP 8.2 FPM
# ============================================================
# Usamos la imagen oficial de PHP 8.2 con FPM (FastCGI Process Manager)
# para manejar solicitudes PHP de forma eficiente junto a Nginx.
# ============================================================
FROM php:8.2-fpm-bookworm AS backend

# ---------- METADATOS DE LA IMAGEN ----------
LABEL maintainer="SisGanaderia"
LABEL description="Backend Laravel 12 para sistema de gestión ganadera"
LABEL version="1.0.0"

# ---------- VARIABLES DE ENTORNO POR DEFECTO ----------
ENV COMPOSER_ALLOW_SUPERUSER=1
ENV TZ=America/Mexico_City

# ---------- CONFIGURACIÓN DE ZONA HORARIA ----------
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# ---------- INSTALACIÓN DE DEPENDENCIAS DEL SISTEMA ----------
# Instalamos paquetes necesarios para:
# - pgsql: Extensión PostgreSQL para PHP
# - libpng-dev, libjpeg-dev: Para DomPDF (generación de PDFs)
# - zip/unzip: Para manejo de archivos comprimidos
# - git: Para algunas dependencias de Composer
# - nano/curl: Utilidades de debug
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    libicu-dev \
    pkg-config \
    zip \
    unzip \
    git \
    curl \
    nano \
    && rm -rf /var/lib/apt/lists/*

# ---------- INSTALACIÓN DE EXTENSIONES PHP ----------
# Extensiones requeridas por Laravel 12 + DomPDF + PostgreSQL:
# - pdo_pgsql: Driver PDO para PostgreSQL
# - pgsql: Extensión nativa PostgreSQL
# - gd: Procesamiento de imágenes (requerido por DomPDF)
# - zip: Manejo de archivos ZIP
# - intl: Internacionalización
# - bcmath: Matemáticas de precisión arbitraria
# - opcache: Cache de bytecode para optimizar rendimiento PHP
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo_pgsql \
    pgsql \
    gd \
    zip \
    intl \
    bcmath \
    opcache

# ---------- CONFIGURACIÓN DE OPCACHE (RENDIMIENTO PHP) ----------
# Estas opciones optimizan el rendimiento en producción al
# cachear el bytecode PHP compilado en memoria.
RUN { \
    echo 'opcache.memory_consumption=256'; \
    echo 'opcache.interned_strings_buffer=16'; \
    echo 'opcache.max_accelerated_files=20000'; \
    echo 'opcache.revalidate_freq=0'; \
    echo 'opcache.validate_timestamps=0'; \
    echo 'opcache.save_comments=1'; \
    echo 'opcache.fast_shutdown=1'; \
    } > /usr/local/etc/php/conf.d/opcache-recommended.ini

# ---------- CONFIGURACIÓN DE PHP.INI PARA PRODUCCIÓN ----------
RUN { \
    echo 'expose_php = Off'; \
    echo 'memory_limit = 256M'; \
    echo 'upload_max_filesize = 50M'; \
    echo 'post_max_size = 50M'; \
    echo 'max_execution_time = 300'; \
    echo 'max_input_time = 300'; \
    echo 'display_errors = Off'; \
    echo 'log_errors = On'; \
    echo 'error_log = /dev/stderr'; \
    echo 'date.timezone = America/Mexico_City'; \
    } > /usr/local/etc/php/conf.d/custom-php.ini

# ---------- USUARIO NO ROOT (BUENA PRÁCTICA DE SEGURIDAD) ----------
# Creamos un usuario dedicado para ejecutar la aplicación, evitando
# ejecutar procesos como root dentro del contenedor.
RUN groupadd -g 1000 appuser \
    && useradd -u 1000 -g appuser -s /bin/bash -m appuser

# ---------- DIRECTORIO DE TRABAJO ----------
WORKDIR /var/www/html

# ---------- COPIA DE DEPENDENCIAS DESDE EL STAGE 1 ----------
COPY --from=composer_deps --chown=appuser:appuser /app/vendor /var/www/html/vendor

# ---------- COPIA DEL CÓDIGO FUENTE ----------
# Copiamos todo el código fuente del backend con los permisos correctos
COPY --chown=appuser:appuser . /var/www/html/

# ---------- EJECUCIÓN DE POST-INSTALL DE COMPOSER ----------
# Necesario para que Laravel descubra paquetes y publique assets
RUN php artisan package:discover --ansi || true

# ---------- CONFIGURACIÓN DE PERMISOS DE CARPETAS ----------
# Laravel necesita escribir en:
# - storage/: logs, cache, sesiones, archivos subidos
# - bootstrap/cache/: cache de configuración, rutas y vistas
RUN chown -R appuser:appuser /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# ---------- DIRECTORIOS OBLIGATORIOS (PUESTOS EXPLÍCITAMENTE) ----------
RUN mkdir -p \
    /var/www/html/storage/app/public \
    /var/www/html/storage/app/private \
    /var/www/html/storage/framework/cache/data \
    /var/www/html/storage/framework/sessions \
    /var/www/html/storage/framework/testing \
    /var/www/html/storage/framework/views \
    /var/www/html/storage/logs \
    && chown -R appuser:appuser /var/www/html/storage /var/www/html/bootstrap/cache

# ---------- COPIA DE SCRIPT DE ENTRYPOINT ----------
# Script que se ejecuta al iniciar el contenedor para:
# - Esperar a que PostgreSQL esté listo
# - Generar APP_KEY si no existe
# - Ejecutar migraciones
# - Ejecutar seeders si es la primera vez
# - Optimizar configuración de Laravel
COPY --chown=appuser:appuser docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# ---------- PUERTO EXPUESTO ----------
# PHP-FPM escucha en el puerto 9000 (protocolo FastCGI)
EXPOSE 9000

# ---------- CAMBIAMOS AL USUARIO NO ROOT ----------
USER appuser

# ---------- PUNTO DE ENTRADA Y COMANDO POR DEFECTO ----------
# El entrypoint se ejecuta al iniciar el contenedor y prepara el entorno.
# Luego ejecuta PHP-FPM para atender solicitudes.
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]
