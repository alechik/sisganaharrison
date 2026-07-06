# Estado del Proyecto

> Snapshot mínimo. **2026-07-06** — post módulo Tipos de Alerta.

**Avance estimado:** ~40–44%

---

## Implementado

| Capa | Qué hay |
|------|---------|
| Backend | Laravel 12, Sanctum, Spatie (~81 permisos, 4 roles), 9 controllers dominio |
| Modelos | User, Raza, CategoriaAnimal, Vacuna, EstadoProductivo, TipoEventoSanitario, TipoMovimiento, **TipoAlerta** |
| Frontend | `user`, `razas`, `categorias-animales`, `vacunas`, `estados-productivos`, `tipos-eventos-sanitarios`, `tipos-movimientos`, **`tipos-alertas`** + PermissionGate |
| BD | **21 tablas** (13 migraciones), PostgreSQL |
| API | **~77 endpoints** |

## Pendiente prioritario

- Lotes → Animales (cadena núcleo ganadero)
- Tests Feature auth/usuarios/permisos
- AuthContext frontend (mejora sobre localStorage)

## Índice de módulos

`docs/06_MODULES_INDEX.md`

## Changelog

`docs/CHANGELOG.md`
