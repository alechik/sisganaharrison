# Estado del Proyecto

> Snapshot mínimo. **2026-07-03** — post módulo Estados Productivos.

**Avance estimado:** ~34–38%

---

## Implementado

| Capa | Qué hay |
|------|---------|
| Backend | Laravel 12, Sanctum, Spatie (~63 permisos, 4 roles), 6 controllers dominio |
| Modelos | User, Raza, CategoriaAnimal, Vacuna, **EstadoProductivo** |
| Frontend | `user`, `razas`, `categorias-animales`, `vacunas`, **`estados-productivos`** + PermissionGate |
| BD | **18 tablas** (10 migraciones), PostgreSQL |
| API | **~50 endpoints** |

## Pendiente prioritario

- Lotes → Animales (cadena núcleo ganadero)
- Tests Feature auth/usuarios/permisos
- AuthContext frontend (mejora sobre localStorage)

## Índice de módulos

`docs/06_MODULES_INDEX.md`

## Changelog

`docs/CHANGELOG.md`
