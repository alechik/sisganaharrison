# Estado del Proyecto

> Snapshot mínimo. **2026-06-28** — post módulo Servicios Reproductivos.

**Avance estimado:** ~54–58%

---

## Implementado

| Capa | Qué hay |
|------|---------|
| Backend | Laravel 12, Sanctum, Spatie (~98 permisos, 4 roles), 16 controllers dominio |
| Modelos | User, catálogos G1, Establecimiento, Potrero, Lote, Animal, Pesaje, EventoSanitario, **ServicioReproductivo** |
| Frontend | `user`, catálogos G1, infraestructura, **`animales`**, **`pesajes`**, **`eventos-sanitarios`**, **`servicios-reproductivos`** + PermissionGate |
| BD | **28 tablas** (20 migraciones), PostgreSQL |
| API | **~124 endpoints** |

## Pendiente prioritario

- Movimientos (transaccionales sobre animales)
- Tests Feature auth/usuarios/permisos
- AuthContext frontend (mejora sobre localStorage)

## Índice de módulos

`docs/06_MODULES_INDEX.md`

## Changelog

`docs/CHANGELOG.md`
