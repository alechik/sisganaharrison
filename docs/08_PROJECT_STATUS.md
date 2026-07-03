# Estado del Proyecto

> Snapshot mínimo. **2026-06-28** — post módulo Vacunas.

**Avance estimado:** ~32–36%

---

## Implementado

| Capa | Qué hay |
|------|---------|
| Backend | Laravel 12, Sanctum, Spatie (~57 permisos, 4 roles), 5 controllers dominio |
| Modelos | User, Raza, CategoriaAnimal, **Vacuna** |
| Frontend | `user`, `razas`, `categorias-animales`, **`vacunas`** + PermissionGate |
| BD | **17 tablas** (9 migraciones), PostgreSQL |
| API | **~41 endpoints** |

## Pendiente prioritario

- Lotes → Animales (cadena núcleo ganadero)
- Tests Feature auth/usuarios/permisos
- AuthContext frontend (mejora sobre localStorage)

## Índice de módulos

`docs/06_MODULES_INDEX.md`

## Changelog

`docs/CHANGELOG.md`
