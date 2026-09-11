# Estado del Proyecto

> Snapshot mínimo. **2026-09-10** — Órdenes de Compra (módulo Compras, etapa 1).

**Avance estimado:** ~66–70%

---

## Implementado

| Capa | Qué hay |
|------|---------|
| Backend | Laravel 12, Sanctum, Spatie (~112 permisos, 4 roles), **22 controllers dominio** |
| Modelos | User, catálogos G1, Establecimiento, Potrero, Lote, Animal, Pesaje, EventoSanitario, ServicioReproductivo, Gestacion, Parto, Nacimiento, Persona, TipoPersona, **OrdenCompra, DetalleOrdenCompra** |
| Frontend | `user`, catálogos G1, infraestructura, `animales`, `pesajes`, `eventos-sanitarios`, `servicios-reproductivos`, `gestaciones`, `partos`, `nacimientos`, `socios-de-negocio`, **`compras` (órdenes)** + PermissionGate |
| BD | **36 tablas** (25 migraciones), PostgreSQL |
| API | **~162 endpoints** |

## Pendiente prioritario

- Cuarentena e Ingreso (continuación del flujo de compras)
- Movimientos (transaccionales sobre animales)
- Tests Feature auth/usuarios/permisos
- AuthContext frontend (mejora sobre localStorage)

## Índice de módulos

`docs/06_MODULES_INDEX.md`

## Changelog

`docs/CHANGELOG.md`

