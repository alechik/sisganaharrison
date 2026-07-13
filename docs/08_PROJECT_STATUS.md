# Estado del Proyecto

> Snapshot mínimo. **2026-07-11** — post módulo Animales.

**Avance estimado:** ~48–52%

---

## Implementado

| Capa | Qué hay |
|------|---------|
| Backend | Laravel 12, Sanctum, Spatie (~96 permisos, 4 roles), 13 controllers dominio |
| Modelos | User, catálogos G1, Establecimiento, Potrero, Lote, **Animal** |
| Frontend | `user`, catálogos G1, infraestructura, **`animales`** + PermissionGate |
| BD | **25 tablas** (17 migraciones), PostgreSQL |
| API | **~113 endpoints** |

## Pendiente prioritario

- Sanitario / Movimientos (transaccionales sobre animales)
- Tests Feature auth/usuarios/permisos
- AuthContext frontend (mejora sobre localStorage)

## Índice de módulos

`docs/06_MODULES_INDEX.md`

## Changelog

`docs/CHANGELOG.md`
