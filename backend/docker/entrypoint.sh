#!/bin/bash
# ============================================================
# ENTRYPOINT.SH - BACKEND LARAVEL
# ============================================================
# Este script se ejecuta AUTOMÁTICAMENTE al iniciar el
# contenedor del backend. Se encarga de preparar el entorno
# de Laravel antes de iniciar PHP-FPM.
#
# Tareas que realiza:
#   1. Espera activamente a que PostgreSQL esté listo
#   2. Copia .env.example a .env si no existe
#   3. Genera APP_KEY si no está configurada
#   4. Ejecuta migraciones de base de datos
#   5. Ejecuta seeders (solo si es la primera vez o si se
#      define la variable DB_SEED=true)
#   6. Optimiza Laravel para producción
#   7. Inicia PHP-FPM (o el comando que se pase como argumento)
# ============================================================

# ---------- CONFIGURACIÓN: SALIR EN CASO DE ERROR ----------
# NOTA: "set -e" desactivado de forma global para no abortar el bucle
# de espera de PostgreSQL (el comando php devuelve exit 1 al no conectar
# y, con set -e, bash terminaría el script en el primer intento). Cada
# paso crítico comprueba su propio resultado explícitamente.
set +e
# Deshabilitar expansión de "!" (historial bash) para evitar conflictos
# con contraseñas que incluyan dicho caracter
set +H

echo "============================================================"
echo "INICIANDO ENTRYPOINT DEL BACKEND LARAVEL"
echo "============================================================"
echo "Fecha/Hora: $(date)"
echo "Directorio actual: $(pwd)"
echo "Usuario: $(whoami)"

# ---------- 1. ESPERA A POSTGRESQL ----------
# Esperamos hasta que el servidor de base de datos acepte conexiones
# Esto previene errores de "Connection refused" al ejecutar migraciones
# antes de que PostgreSQL haya terminado de inicializarse.
echo ""
echo "→ [1/7] Esperando a que PostgreSQL esté listo..."

# IMPORTANTE: La conexión PDO se resuelve 100% dentro de PHP usando getenv().
# De este modo, el shell bash NO toca/interpola las credenciales (contraseñas
# con !, comillas, $, &, etc.), evitando bugs de expansión.
export PHP_WAIT_TIMEOUT=2

# Número máximo de intentos y tiempo entre intentos
MAX_TRIES=60
WAIT_SECONDS=2
TRIES=0

# Bucle de espera: intentamos conectarnos a PostgreSQL
while [ $TRIES -lt $MAX_TRIES ]; do
    CONNECT_RESULT=$(php -r '
        try {
            $dbhost = getenv("DB_HOST") ?: "127.0.0.1";
            $dbport = getenv("DB_PORT") ?: "5432";
            $dbname = getenv("DB_DATABASE") ?: "postgres";
            $dbuser = getenv("DB_USERNAME") ?: "postgres";
            $dbpass = getenv("DB_PASSWORD") ?: "";
            $tout   = (int)(getenv("PHP_WAIT_TIMEOUT") ?: 2);

            $pdo = new PDO(
                "pgsql:host=$dbhost;port=$dbport;dbname=$dbname",
                $dbuser,
                $dbpass,
                [PDO::ATTR_TIMEOUT => $tout]
            );
            echo "OK";
        } catch (Throwable $e) {
            echo "ERR: " . $e->getMessage();
            exit(1);
        }
    ')

    if [ "$CONNECT_RESULT" = "OK" ]; then
        echo "  ✓ PostgreSQL acepta conexiones (host=${DB_HOST:-127.0.0.1}:${DB_PORT:-5432})"
        break
    fi

    TRIES=$((TRIES + 1))
    if [ $TRIES -eq $MAX_TRIES ] || [ $((TRIES % 10)) -eq 0 ]; then
        echo "  ↻ Intento ${TRIES}/${MAX_TRIES}... Error: ${CONNECT_RESULT}"
    else
        echo "  ↻ Intento ${TRIES}/${MAX_TRIES}... esperando ${WAIT_SECONDS}s"
    fi
    sleep $WAIT_SECONDS
done

# Si superamos el máximo de intentos, salimos con error
if [ $TRIES -eq $MAX_TRIES ]; then
    echo "  ✗ ERROR: No se pudo conectar a PostgreSQL después de $((MAX_TRIES * WAIT_SECONDS)) segundos"
    echo "  Host: ${DB_HOST:-127.0.0.1}:${DB_PORT:-5432}, Usuario: ${DB_USERNAME:-postgres}, DB: ${DB_DATABASE:-sisganaderia}"
    exit 1
fi

# ---------- 2. ARCHIVO .ENV ----------
# Si no existe .env, lo creamos a partir de .env.example
echo ""
echo "→ [2/7] Verificando archivo .env..."
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "  ↳ Creando .env desde .env.example"
        cp .env.example .env
    else
        echo "  ↳ No existe .env ni .env.example: creando .env vacío"
        touch .env
    fi
else
    echo "  ✓ .env ya existe"
fi

# ---------- 2b. SINCRONIZAR .ENV CON EL ENTORNO REAL ----------
# Motivo: php-fpm limpia el entorno de los workers (clear_env=yes) y PHP
# sólo publica en $_SERVER las directivas "env[]" del pool.conf, así que
# las variables de Docker no siempre llegan a Laravel aunque estén en el
# entorno del proceso. Volcándolas a .env el arranque es determinista.
# Se hace con PHP (no con sed de bash) para no romper contraseñas que
# contengan &, $, #, comillas o barra invertida.
echo ""
echo "→ [2b/7] Sincronizando .env con las variables del contenedor..."
php -r '
$keys = [
    "APP_NAME", "APP_ENV", "APP_DEBUG", "APP_URL", "APP_KEY", "APP_LOCALE",
    "DB_CONNECTION", "DB_HOST", "DB_PORT", "DB_DATABASE", "DB_USERNAME",
    "DB_PASSWORD", "DB_SSLMODE",
    "CACHE_STORE", "CACHE_DRIVER", "SESSION_DRIVER", "QUEUE_CONNECTION",
    "FILESYSTEM_DISK", "LOG_CHANNEL", "LOG_LEVEL", "MAIL_MAILER",
    "BCRYPT_ROUNDS",
];
$file = ".env";
$lines = is_file($file) ? (explode("\n", file_get_contents($file)) ?: []) : [];
$values = [];
foreach ($lines as $line) {
    if (preg_match("/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/", $line, $m)) {
        $values[$m[1]] = trim($m[2]);
    }
}
$changed = 0;
foreach ($keys as $k) {
    $v = getenv($k);
    if ($v === false || $v === "") { continue; }
    $values[$k] = $v;
    $changed++;
}
$out = "";
foreach ($values as $k => $v) {
    $v = preg_replace("/\s*#.*$/", "", $v);
    $v = trim($v);
    if ($v === "") { continue; }
    if (preg_match("/\s/", $v)) { $v = "\"" . str_replace("\"", "\\\"", $v) . "\""; }
    $out .= $k . "=" . $v . PHP_EOL;
}
file_put_contents($file, $out);
echo "  ✓ .env sincronizado ($changed variables del entorno aplicadas)" . PHP_EOL;
' || echo "  ⚠ No se pudo sincronizar .env (se usará el existente)"

# ---------- 3. GENERAR APP_KEY ----------
# Laravel requiere una APP_KEY para cifrar sesiones, cookies y los tokens
# de Sanctum. El .env vive en la imagen (no en un volumen), así que sin
# esto se regeneraría en cada reinicio y el usuario perdería la sesión.
# Por eso la guardamos en storage/app/.app_key, que SÍ está en el volumen
# persistente backend_storage.
echo ""
echo "→ [3/7] Verificando APP_KEY..."
KEY_FILE="storage/app/.app_key"
mkdir -p storage/app
CURRENT_APP_KEY=$(grep '^APP_KEY=' .env 2>/dev/null | cut -d '=' -f2 | tr -d '"' | tr -d "'" || true)
CURRENT_APP_KEY=$(printf '%s' "$CURRENT_APP_KEY" | tr -d '\r' | xargs)

if [ -n "$CURRENT_APP_KEY" ]; then
    echo "  ✓ APP_KEY ya configurada"
elif [ -s "$KEY_FILE" ]; then
    echo "  ↳ Reutilizando APP_KEY guardada en $KEY_FILE"
    php -r '
        $key = trim(file_get_contents("storage/app/.app_key"));
        $file = ".env";
        $lines = is_file($file) ? explode("\n", file_get_contents($file)) : [];
        $out = [];
        $done = false;
        foreach ($lines as $l) {
            if (preg_match("/^\s*APP_KEY\s*=/", $l)) { $out[] = "APP_KEY=" . $key; $done = true; }
            else { $out[] = $l; }
        }
        if (!$done) { $out[] = "APP_KEY=" . $key; }
        file_put_contents($file, implode("\n", $out));
    ' || { echo "  ✗ ERROR: no se pudo escribir APP_KEY"; exit 1; }
else
    echo "  ↳ Generando nueva APP_KEY..."
    php artisan key:generate --ansi --force || { echo "  ✗ ERROR: no se pudo generar APP_KEY"; exit 1; }
    grep '^APP_KEY=' .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d '\r' | xargs > "$KEY_FILE"
    echo "  ✓ APP_KEY generada y guardada en $KEY_FILE"
fi

# ---------- 4. EJECUTAR MIGRACIONES ----------
# Aplicamos todas las migraciones pendientes a la base de datos
# --force: Ejecuta en producción sin pedir confirmación
echo ""
echo "→ [4/7] Ejecutando migraciones de base de datos..."
php artisan migrate --force --ansi || { echo "  ✗ ERROR: fallaron las migraciones"; exit 1; }

# ---------- 5. SEEDERS (DATOS INICIALES) ----------
# Ejecutamos seeders SOLO la primera vez (si no existe el marcador .seeded)
# y el usuario ha dejado DB_SEED=true. El marcador evita re-ejecutarlos en
# cada arranque del contenedor aunque DB_SEED siga en true.
echo ""
echo "→ [5/7] Verificando seeders..."
if [ "${DB_SEED:-false}" = "true" ] && [ ! -f storage/app/.seeded ]; then
    echo "  ↳ Ejecutando seeders de datos iniciales..."
    php artisan db:seed --force --ansi || { echo "  ✗ ERROR: fallaron los seeders"; exit 1; }

    # Creamos el marcador para no volver a ejecutar los seeders automáticamente
    touch storage/app/.seeded
    echo "  ✓ Seeders ejecutados correctamente"
else
    echo "  ✓ Seeders ya ejecutados anteriormente (omitiendo)"
    echo "    Tip: Para volver a ejecutarlos, borra el archivo storage/app/.seeded o usa DB_SEED=true"
fi

# ---------- 6. OPTIMIZACIÓN DE LARAVEL ----------
# En entornos de producción, Laravel recomienda cachear:
#   - Configuración (config:cache)
#   - Rutas (route:cache)
#   - Vistas (view:cache)
# Esto mejora significativamente el rendimiento.
echo ""
echo "→ [6/7] Optimizando Laravel para producción..."

# Limpiamos cachés anteriores
php artisan config:clear --quiet
php artisan route:clear --quiet
php artisan view:clear --quiet
php artisan cache:clear --quiet

# config:cache es obligatorio: sin él, php-fpm puede no ver las variables
# del contenedor (clear_env de FPM) y usaría .env.example por defecto.
if ! php artisan config:cache --ansi; then
    echo "  ✗ ERROR: falló config:cache (configuración inconsistente)"
    exit 1
fi
echo "  ✓ config:cache aplicado"

# route:cache / view:cache son opcionales: si algo falla (p. ej. una ruta
# con Closure en routes/web.php, que Laravel no puede serializar) el
# arranque debe continuar igualmente, solo que sin esa caché.
if php artisan route:cache --ansi; then
    echo "  ✓ route:cache aplicado"
else
    echo "  ⚠ route:cache no disponible (rutas con Closure); se sigue sin cachear"
    php artisan route:clear --quiet
fi

if php artisan view:cache --ansi; then
    echo "  ✓ view:cache aplicado"
else
    echo "  ⚠ view:cache no disponible; se sigue sin cachear"
fi

echo "  ✓ Optimización completada"

# ---------- 7. INICIAR PHP-FPM ----------
echo ""
echo "============================================================"
echo "ENTORNO PREPARADO CORRECTAMENTE"
echo "Iniciando PHP-FPM..."
echo "============================================================"
echo ""

# Ejecutamos el comando que se nos pase (por defecto "php-fpm")
# exec reemplaza este proceso por el de PHP-FPM para que las señales
# (SIGTERM, SIGINT, etc.) se propaguen correctamente.
exec "$@"
