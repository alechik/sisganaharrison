# Estado del Proyecto

> Snapshot mínimo. **2026-09-24** — Módulo Ventas; `animales.estado` reemplaza `activo`.

**Avance estimado:** ~76–80%

---

## Implementado

| Capa | Qué hay |
|------|---------|
| Backend | Laravel 12, Sanctum, Spatie (~116 permisos, 4 roles), **25 controllers dominio** |
| Modelos | User, catálogos G1, Establecimiento, Potrero, Lote, Animal, Pesaje, EventoSanitario, AnimalEvento, ServicioReproductivo, Gestacion, Parto, Nacimiento, Persona, TipoPersona, OrdenCompra, DetalleOrdenCompra, Cuarentena, CuarentenaDetalle, Ingreso, DetalleIngreso, **Venta, DetalleVenta** |
| Frontend | `user`, catálogos G1, infraestructura, `animales`, `pesajes`, `eventos-sanitarios`, `servicios-reproductivos`, `gestaciones`, `partos`, `nacimientos`, `socios-de-negocio`, `compras`, **`ventas`** + PermissionGate |
| BD | **43 tablas** (33 migraciones), PostgreSQL |
| API | **~175 endpoints** |

## Pendiente prioritario

- Movimientos (transaccionales sobre animales)
- Tests Feature auth/usuarios/permisos
- AuthContext frontend (mejora sobre localStorage)

## Índice de módulos

`docs/06_MODULES_INDEX.md`

## Changelog

`docs/CHANGELOG.md`
