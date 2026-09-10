# Estado del Proyecto

> Snapshot mínimo. **2026-09-09** — unificación Socios de Negocios.

**Avance estimado:** ~62–66%

---

## Implementado

| Capa | Qué hay |
|------|---------|
| Backend | Laravel 12, Sanctum, Spatie (~108 permisos, 4 roles), **21 controllers dominio** |
| Modelos | User, catálogos G1, Establecimiento, Potrero, Lote, Animal, Pesaje, EventoSanitario, ServicioReproductivo, Gestacion, Parto, Nacimiento, **Persona, TipoPersona** |
| Frontend | `user`, catálogos G1, infraestructura, `animales`, `pesajes`, `eventos-sanitarios`, `servicios-reproductivos`, `gestaciones`, `partos`, `nacimientos`, **`socios-de-negocio`** + PermissionGate |
| BD | **34 tablas** (24 migraciones), PostgreSQL |
| API | **~154 endpoints** |

## Pendiente prioritario

- Movimientos (transaccionales sobre animales)
- Tests Feature auth/usuarios/permisos
- AuthContext frontend (mejora sobre localStorage)

## Índice de módulos

`docs/06_MODULES_INDEX.md`

## Changelog

`docs/CHANGELOG.md`
