# Estado del Proyecto

> Snapshot mínimo. **2026-09-27** — Traspasos entre lotes.

**Avance estimado:** ~76–80%

---

## Implementado

| Capa | Qué hay |
|------|---------|
| Backend | Laravel 12, Sanctum, Spatie (~118 permisos, 4 roles), **26 controllers dominio** |
| Modelos | User, catálogos G1, Presentacion, Medicamento, Establecimiento, Potrero, Lote, Animal, Pesaje, DetallePesaje, EventoSanitario, DetalleEventoSanitario, AnimalEvento, ServicioReproductivo, Gestacion, Parto, Nacimiento, Persona, TipoPersona, OrdenCompra, DetalleOrdenCompra, Cuarentena, CuarentenaDetalle, Ingreso, DetalleIngreso, Venta, DetalleVenta, Salida, DetalleSalida, Traspaso, DetalleTraspaso |
| Frontend | `user`, catálogos G1, **Tipos de Salidas**, infraestructura, `animales`, `pesajes`, `eventos-sanitarios`, `servicios-reproductivos`, `gestaciones`, `partos`, `nacimientos`, `socios-de-negocio`, `compras`, `ventas`, **`salidas`**, **`traspasos`** + PermissionGate |
| BD | **46 tablas** (36 migraciones), PostgreSQL |
| API | **~181 endpoints** |

## Pendiente prioritario

- Movimientos (transaccionales sobre animales)
- Tests Feature auth/usuarios/permisos
- AuthContext frontend (mejora sobre localStorage)

## Índice de módulos

`docs/06_MODULES_INDEX.md`

## Changelog

`docs/CHANGELOG.md`
