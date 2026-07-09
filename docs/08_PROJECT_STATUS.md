# Estado del Proyecto

> Snapshot mínimo. **2026-07-08** — post módulo Potreros.

**Avance estimado:** ~44–48%

---

## Implementado

| Capa | Qué hay |
|------|---------|
| Backend | Laravel 12, Sanctum, Spatie (~93 permisos, 4 roles), 11 controllers dominio |
| Modelos | User, catálogos G1, Establecimiento, **Potrero** |
| Frontend | `user`, catálogos G1, `establecimientos`, **`potreros`** + PermissionGate |
| BD | **23 tablas** (15 migraciones), PostgreSQL |
| API | **~95 endpoints** |

## Pendiente prioritario

- Lotes → Animales (cadena infraestructura y núcleo ganadero)
- Tests Feature auth/usuarios/permisos
- AuthContext frontend (mejora sobre localStorage)

## Índice de módulos

`docs/06_MODULES_INDEX.md`

## Changelog

`docs/CHANGELOG.md`
