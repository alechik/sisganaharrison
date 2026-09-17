# Estado del Proyecto

> Snapshot mínimo. **2026-09-16** — Ingresos desde cuarentena COMPLETADA (parciales).

**Avance estimado:** ~76–80%

---

## Implementado

| Capa | Qué hay |
|------|---------|
| Backend | Laravel 12, Sanctum, Spatie (~112 permisos, 4 roles), **24 controllers dominio** |
| Modelos | User, catálogos G1, Establecimiento, Potrero, Lote, Animal, Pesaje, EventoSanitario, AnimalEvento, ServicioReproductivo, Gestacion, Parto, Nacimiento, Persona, TipoPersona, OrdenCompra, DetalleOrdenCompra, Cuarentena, CuarentenaDetalle, **Ingreso, DetalleIngreso** |
| Frontend | `user`, catálogos G1, infraestructura, `animales`, `pesajes`, `eventos-sanitarios`, `servicios-reproductivos`, `gestaciones`, `partos`, `nacimientos`, `socios-de-negocio`, **`compras` (órdenes + cuarentenas + ingresos)** + PermissionGate |
| BD | **41 tablas** (29 migraciones), PostgreSQL |
| API | **~175 endpoints** |

## Pendiente prioritario

- Movimientos (transaccionales sobre animales)
- Tests Feature auth/usuarios/permisos
- AuthContext frontend (mejora sobre localStorage)

## Índice de módulos

`docs/06_MODULES_INDEX.md`

## Changelog

`docs/CHANGELOG.md`
