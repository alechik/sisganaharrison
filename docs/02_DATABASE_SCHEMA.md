# Índice de Base de Datos

> **Fuente oficial del modelo de datos:** `docs/12_DATABASE/`  
> Este archivo es **solo navegación**. No documentar tablas aquí.

---

## Dominios

| Archivo | Contenido |
|---------|-----------|
| [12_DATABASE/00_Plataforma.md](./12_DATABASE/00_Plataforma.md) | users, sessions, Sanctum, Spatie RBAC, cache, jobs |
| [12_DATABASE/01_Catalogos.md](./12_DATABASE/01_Catalogos.md) | razas, categorías_animales, patrón catálogos |
| [12_DATABASE/02_Infraestructura.md](./12_DATABASE/02_Infraestructura.md) | establecimientos, potreros, lotes |
| [12_DATABASE/03_Nucleo_Ganadero.md](./12_DATABASE/03_Nucleo_Ganadero.md) | animales, movimientos, pesajes |
| [12_DATABASE/04_Reproduccion.md](./12_DATABASE/04_Reproduccion.md) | servicios, partos, destetes |
| [12_DATABASE/05_Gestion.md](./12_DATABASE/05_Gestion.md) | sanitario, alertas, indicadores |

## Reglas

1. Toda spec de tabla vive **únicamente** en el archivo de dominio correspondiente.
2. Al crear migración: leer el dominio + copiar patrón de migración existente (ej. `razas`).
3. Tras implementar tabla nueva: actualizar el archivo de dominio en `12_DATABASE/`.
4. **No** actualizar este índice con definiciones de columnas.

## Implementado vs planificado

Tablas con migración en repo: ver `backend/database/migrations/` y filas ✅ en `docs/06_MODULES_INDEX.md`.
