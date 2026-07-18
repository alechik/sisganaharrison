# Estado del Proyecto

> Snapshot mínimo. **2026-06-28** — post módulo Nacimientos.

**Avance estimado:** ~60–64%

---

## Implementado

| Capa | Qué hay |
|------|---------|
| Backend | Laravel 12, Sanctum, Spatie (~98 permisos, 4 roles), **19 controllers dominio** |
| Modelos | User, catálogos G1, Establecimiento, Potrero, Lote, Animal, Pesaje, EventoSanitario, ServicioReproductivo, Gestacion, Parto, **Nacimiento** |
| Frontend | `user`, catálogos G1, infraestructura, **`animales`**, **`pesajes`**, **`eventos-sanitarios`**, **`servicios-reproductivos`**, **`gestaciones`**, **`partos`**, **`nacimientos`** + PermissionGate |
| BD | **31 tablas** (23 migraciones), PostgreSQL |
| API | **~139 endpoints** |

## Pendiente prioritario

- Movimientos (transaccionales sobre animales)
- Tests Feature auth/usuarios/permisos
- AuthContext frontend (mejora sobre localStorage)

## Índice de módulos

`docs/06_MODULES_INDEX.md`

## Changelog

`docs/CHANGELOG.md`
