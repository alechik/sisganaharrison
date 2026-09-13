# Estado del Proyecto

> Snapshot mínimo. **2026-09-12** — Cuarentenas (módulo Compras, etapa 2).

**Avance estimado:** ~70–74%

---

## Implementado

| Capa | Qué hay |
|------|---------|
| Backend | Laravel 12, Sanctum, Spatie (~112 permisos, 4 roles), **23 controllers dominio** |
| Modelos | User, catálogos G1, Establecimiento, Potrero, Lote, Animal, Pesaje, EventoSanitario, ServicioReproductivo, Gestacion, Parto, Nacimiento, Persona, TipoPersona, OrdenCompra, DetalleOrdenCompra, **Cuarentena, CuarentenaDetalle** |
| Frontend | `user`, catálogos G1, infraestructura, `animales`, `pesajes`, `eventos-sanitarios`, `servicios-reproductivos`, `gestaciones`, `partos`, `nacimientos`, `socios-de-negocio`, **`compras` (órdenes + cuarentenas)** + PermissionGate |
| BD | **38 tablas** (26 migraciones), PostgreSQL |
| API | **~170 endpoints** |

## Pendiente prioritario

- Ingreso (continuación del flujo de compras)
- Movimientos (transaccionales sobre animales)
- Tests Feature auth/usuarios/permisos
- AuthContext frontend (mejora sobre localStorage)

## Índice de módulos

`docs/06_MODULES_INDEX.md`

## Changelog

`docs/CHANGELOG.md`
