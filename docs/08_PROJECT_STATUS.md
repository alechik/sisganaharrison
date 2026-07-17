# Estado del Proyecto

> Snapshot mínimo. **2026-06-28** — post módulo Gestaciones.

**Avance estimado:** ~56–60%

---

## Implementado

| Capa | Qué hay |
|------|---------|
| Backend | Laravel 12, Sanctum, Spatie (~98 permisos, 4 roles), **17 controllers dominio** |
| Modelos | User, catálogos G1, Establecimiento, Potrero, Lote, Animal, Pesaje, EventoSanitario, ServicioReproductivo, **Gestacion** |
| Frontend | `user`, catálogos G1, infraestructura, **`animales`**, **`pesajes`**, **`eventos-sanitarios`**, **`servicios-reproductivos`**, **`gestaciones`** + PermissionGate |
| BD | **29 tablas** (21 migraciones), PostgreSQL |
| API | **~129 endpoints** |

## Pendiente prioritario

- Movimientos (transaccionales sobre animales)
- Tests Feature auth/usuarios/permisos
- AuthContext frontend (mejora sobre localStorage)

## Índice de módulos

`docs/06_MODULES_INDEX.md`

## Changelog

`docs/CHANGELOG.md`
