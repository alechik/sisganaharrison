# Estado del Proyecto

> Snapshot mínimo. **2026-07-11** — post módulo Lotes.

**Avance estimado:** ~46–50%

---

## Implementado

| Capa | Qué hay |
|------|---------|
| Backend | Laravel 12, Sanctum, Spatie (~95 permisos, 4 roles), 12 controllers dominio |
| Modelos | User, catálogos G1, Establecimiento, Potrero, **Lote** |
| Frontend | `user`, catálogos G1, `establecimientos`, `potreros`, **`lotes`** + PermissionGate |
| BD | **24 tablas** (16 migraciones), PostgreSQL |
| API | **~104 endpoints** |

## Pendiente prioritario

- Animales (núcleo ganadero)
- Tests Feature auth/usuarios/permisos
- AuthContext frontend (mejora sobre localStorage)

## Índice de módulos

`docs/06_MODULES_INDEX.md`

## Changelog

`docs/CHANGELOG.md`
