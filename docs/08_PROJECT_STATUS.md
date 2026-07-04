# Estado del Proyecto

> Snapshot mínimo. **2026-07-03** — post módulo Tipos de Eventos Sanitarios.

**Avance estimado:** ~36–40%

---

## Implementado

| Capa | Qué hay |
|------|---------|
| Backend | Laravel 12, Sanctum, Spatie (~69 permisos, 4 roles), 7 controllers dominio |
| Modelos | User, Raza, CategoriaAnimal, Vacuna, EstadoProductivo, **TipoEventoSanitario** |
| Frontend | `user`, `razas`, `categorias-animales`, `vacunas`, `estados-productivos`, **`tipos-eventos-sanitarios`** + PermissionGate |
| BD | **19 tablas** (11 migraciones), PostgreSQL |
| API | **~59 endpoints** |

## Pendiente prioritario

- Lotes → Animales (cadena núcleo ganadero)
- Tests Feature auth/usuarios/permisos
- AuthContext frontend (mejora sobre localStorage)

## Índice de módulos

`docs/06_MODULES_INDEX.md`

## Changelog

`docs/CHANGELOG.md`
