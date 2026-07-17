# Estado del Proyecto

> Snapshot mínimo. **2026-06-28** — post módulo Pesajes.

**Avance estimado:** ~50–54%

---

## Implementado

| Capa | Qué hay |
|------|---------|
| Backend | Laravel 12, Sanctum, Spatie (~98 permisos, 4 roles), 14 controllers dominio |
| Modelos | User, catálogos G1, Establecimiento, Potrero, Lote, Animal, **Pesaje** |
| Frontend | `user`, catálogos G1, infraestructura, **`animales`**, **`pesajes`** + PermissionGate |
| BD | **26 tablas** (18 migraciones), PostgreSQL |
| API | **~116 endpoints** |

## Pendiente prioritario

- Sanitario / Movimientos (transaccionales sobre animales)
- Tests Feature auth/usuarios/permisos
- AuthContext frontend (mejora sobre localStorage)

## Índice de módulos

`docs/06_MODULES_INDEX.md`

## Changelog

`docs/CHANGELOG.md`
