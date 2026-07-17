# Estado del Proyecto

> Snapshot mínimo. **2026-06-28** — post módulo Eventos Sanitarios.

**Avance estimado:** ~52–56%

---

## Implementado

| Capa | Qué hay |
|------|---------|
| Backend | Laravel 12, Sanctum, Spatie (~98 permisos, 4 roles), 15 controllers dominio |
| Modelos | User, catálogos G1, Establecimiento, Potrero, Lote, Animal, Pesaje, **EventoSanitario** |
| Frontend | `user`, catálogos G1, infraestructura, **`animales`**, **`pesajes`**, **`eventos-sanitarios`** + PermissionGate |
| BD | **27 tablas** (19 migraciones), PostgreSQL |
| API | **~119 endpoints** |

## Pendiente prioritario

- Movimientos (transaccionales sobre animales)
- Tests Feature auth/usuarios/permisos
- AuthContext frontend (mejora sobre localStorage)

## Índice de módulos

`docs/06_MODULES_INDEX.md`

## Changelog

`docs/CHANGELOG.md`
