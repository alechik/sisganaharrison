# Estado del Proyecto

> Snapshot mínimo. **2026-07-04** — post módulo Tipos de Movimiento.

**Avance estimado:** ~38–42%

---

## Implementado

| Capa | Qué hay |
|------|---------|
| Backend | Laravel 12, Sanctum, Spatie (~75 permisos, 4 roles), 8 controllers dominio |
| Modelos | User, Raza, CategoriaAnimal, Vacuna, EstadoProductivo, TipoEventoSanitario, **TipoMovimiento** |
| Frontend | `user`, `razas`, `categorias-animales`, `vacunas`, `estados-productivos`, `tipos-eventos-sanitarios`, **`tipos-movimientos`** + PermissionGate |
| BD | **20 tablas** (12 migraciones), PostgreSQL |
| API | **~68 endpoints** |

## Pendiente prioritario

- Lotes → Animales (cadena núcleo ganadero)
- Tests Feature auth/usuarios/permisos
- AuthContext frontend (mejora sobre localStorage)

## Índice de módulos

`docs/06_MODULES_INDEX.md`

## Changelog

`docs/CHANGELOG.md`
