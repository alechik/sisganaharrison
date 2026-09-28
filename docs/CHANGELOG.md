# Changelog

Todos los cambios notables del proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

---

## [Unreleased]

_Pendiente: módulos transaccionales (Movimientos)._

---

## [2026-09-27] — Traspasos entre lotes

### Added

**Traspasos:** cabecera (`lote_salida_id`, `lote_ingreso_id`, `fecha_traspaso`, `observacion`, `total_peso`, `monto_total`) y detalle por animal (`cantidad` 1, `peso`, `precio`, `subtotal`). Al confirmar se actualiza `animales.lote_id` en la misma transacción. Permisos `traspasos.view` / `traspasos.create`. PDF con el patrón de Ingresos/Salidas. Edición (`traspasos.update`) restringida a `administrador` y `gerencia`, con reversión/asignación de `lote_id` en transacción.

---

## [2026-09-27] — Eventos sanitarios: presentaciones y medicamentos

### Changed

**Sanidad:** catálogos `presentaciones` y `medicamentos` (reemplazan Vacunas en el flujo operativo). Evento sanitario con cabecera (`tipo_evento_id`, `user_id`, `fecha`, `diagnostico`, `tratamiento`, `total`, `observaciones`) y detalle histórico por animal (`lote_id`, `peso_animal`, `medicamento_id`, `precio_medicamento`). Creación transaccional; `trabajador` y `veterinario` pueden registrar sin autorización.

---

## [2026-09-26] — Pesajes cabecera + detalle

### Changed

**Pesajes:** sesión con `codigo_pesaje` correlativo, `fecha_pesaje`, `total_peso`, `observacion` y detalle por animal (`animal_id`, `lote_id`, `peso`). Alta manual de 1 a N animales con búsqueda por código. Un ingreso genera un único pesaje; un nacimiento VIVO genera pesaje con el código del parto; MUERTO no genera pesaje.

---

## [2026-09-25] — Módulo Salidas

### Added

**Salidas:** registro `REGISTRADO` con tipo del catálogo. Tipo Venta carga una venta autorizada (`Traer información`) y pasa animales a `VENDIDO`. Perdido/Robo/Muerte no usan `venta_id`; búsqueda de animales por código/arete. Muerte → `MUERTO`; Robo/Perdido → `OTRO`. PDF con el patrón de Ingresos/Ventas.

---

## [2026-09-25] — Catálogo Tipos de Salidas

### Added

**Tipos de Salidas:** catálogo CRUD con `nombre` obligatorio y único. Semilla: Venta, Perdido, Robo, Muerte. Soft delete con restauración. El módulo Salidas no se implementa aún.

---

## [2026-09-24] — Módulo Ventas y estado operativo del animal

### Added

**Ventas:** alta en `PENDIENTE`, reserva `ACTIVO → RESERVADO`, edición solo pendiente, autorización/anulación por gerencia sin marcar `VENDIDO`. Select de animales por potrero/lote/categoría. PDF con el patrón de Ingresos.

### Changed

**Animales:** `activo` boolean se reemplaza por `estado` (`ACTIVO`, `RESERVADO`, `VENDIDO`, etc.). Los filtros existentes de “activo” equivalen a `estado = ACTIVO`.

**Documentación:** Actualizados `06`, `08`, `12_DATABASE/03_Nucleo_Ganadero.md`

---

## [2026-09-24] — Select de cuarentenas en Nuevo Ingreso

### Changed

**Ingresos:** el alta lista únicamente cuarentenas `COMPLETADO` con al menos un animal todavía no registrado en `detalle_ingresos`. Una cuarentena con ingresos parciales sigue apareciendo hasta agotar sus animales. El detalle de pendientes sigue excluyendo animales ya ingresados.

**Documentación:** Actualizado `06`

---

## [2026-09-24] — Precio por kilo en animales e edad en meses

### Added

**Animales:** columna nullable `precio_kilo`. Al confirmar un Ingreso se calcula `precio_compra / peso_ingreso` (precio de cuarentena/OC ya copiado en el detalle) y se guarda en el mismo animal, dentro de la transacción existente.

### Changed

**Edad:** etiquetas y mensajes de Orden de Compra, Cuarentena, Ingreso y Animales indican explícitamente **meses**. No hay conversión de valores.

**Documentación:** Actualizados `06`, `08`, `12_DATABASE/03_Nucleo_Ganadero.md`

---

## [2026-09-23] — Servicios reproductivos: hembra y macho con arete

### Changed

**Servicios reproductivos:** los selects de hembra y macho del formulario solo listan animales activos con arete asignado (no nulo ni vacío). El alta/edición también lo valida en backend.

**Documentación:** Actualizados `06`, `08`

---

## [2026-09-22] — Control de flujo reproductivo (gestación/parto/nacimiento)

### Changed

**Gestaciones:** el alta solo admite servicios con resultado PREÑADA y sin gestación asociada (filtro de opciones + validación backend).

**Partos:** columna `estado` (`PENDIENTE` | `FINALIZADA`). El registro crea el parto en PENDIENTE y, en la misma transacción, pasa la gestación a FINALIZADA. Solo gestaciones ACTIVA (sin parto) pueden generar un parto. Acción manual PENDIENTE → FINALIZADA en listado y detalle (`PATCH /partos/{id}/estado`).

**Nacimientos:** el selector de parto lista únicamente PENDIENTE. Un parto FINALIZADO no puede usarse para un nacimiento nuevo. No se altera la lógica VIVO/MUERTO.

**Documentación:** Actualizados `06`, `08`

---

## [2026-09-20] — Nacimientos: cría automática solo si VIVO

### Changed

**Nacimientos:** se elimina la vinculación opcional de un animal existente. Un nacimiento **VIVO** crea la cría (código de Animales, categoría Ternero/Ternera, fecha = parto, madre/padre del servicio) y, si hay peso, un pesaje de nacimiento. Un nacimiento **MUERTO** no crea animal ni pesaje (`animal_id` nulo). Misma transacción.

**Formulario:** bloque de ficha del animal solo con estado VIVO; con MUERTO solo sexo, peso, causa de muerte y observaciones.

**Documentación:** Actualizados `06`, `08`

---

## [2026-09-16] — Compras: Ingresos

### Added

**Backend:**
- Tablas `ingresos` y `detalle_ingresos` (código `ING-YYYY-NNNN`; `cuarentena_id` obligatorio)
- Tabla `animal_eventos` para trazabilidad de ingreso (y futuros movimientos)
- Ingreso solo desde cuarentena `COMPLETADO`; selección parcial de animales; un animal no se reingresa en la misma cuarentena
- Al confirmar: transacción (cabecera, detalles, actualización del mismo `animal_id`, lote, pesaje de ingreso, evento)
- Al completar cuarentena: pesaje histórico con el peso de OC/cuarentena y fecha de registro (`Pesaje de cuarentena`)
- PDF Nota de Ingreso (`PdfGenerator`)

**Frontend:**
- Listado, alta desde cuarentena COMPLETADA, detalle y PDF
- Formulario: lote, fecha, observaciones, selección de animales, peso de ingreso y ficha pendiente del animal

**Documentación:** Actualizados `06`, `08`

---

## [2026-09-14] — Nacimiento, pesaje y edad inicial en compras

### Changed

**Animales:** `user_id`, `edad_inicial` y `edad_actual` alineados al SQL de referencia. Siguen siendo obligatorios `codigo`, `sexo` y `categoria_id`.

**Nacimientos / Pesajes:** un nacimiento VIVO vincula o crea el animal (sin duplicar `animal_id`) y, si hay `peso_nacimiento`, genera un pesaje identificado como de nacimiento. Transacción única.

**Orden de Compra / Cuarentena:** `edad` en el detalle; se copia a `animales.edad_inicial`/`edad_actual` en el preliminar. Cuarentena conserva el mismo `animal_id` y la edad. No se inventa `fecha_nacimiento` en la compra.

**Documentación:** Actualizados `06`, `08`

---

## [2026-09-13] — Animal preliminar en compras

### Changed

**Animales:**
- Obligatorios solo `codigo` (único, `AN-{CATEGORIA}-000`), `sexo` (M/H) y `categoria_id`
- Resto de ficha nullable (arete, raza, lote, fecha de nacimiento, estado productivo, padres, color)
- Generación de código centralizada en `AnimalService` y reutilizada por Órdenes y Cuarentena

**Orden de Compra / Cuarentena:**
- Cada línea identifica un animal preliminar (`animal_id`) con código, sexo y categoría
- Cantidad coherente con ejemplares identificados (cantidad > 1 genera N preliminares)
- Cuarentena desde OC copia los mismos `animal_id` (sin duplicar)
- Cuarentena directa crea preliminares con la misma lógica
- PDF de OC y Cuarentena muestran código, sexo, categoría, cantidad, peso, precio, descuento y subtotal (más estado en cuarentena)

**Frontend:** Formularios y detalle muestran Código | Sexo | Categoría (no solo IDs)

**Documentación:** Actualizados `06`, `08`

---

## [2026-09-12] — Compras: Cuarentenas

### Added

**Backend:**
- Tablas `cuarentenas` y `cuarentena_detalle` (`animal_id` nulo; sin alta automática)
- Origen `ORDEN_COMPRA` (una por orden autorizada) o `DIRECTA` (excepción sin generar OC)
- Estados PROCESADO → COMPLETADO con `fecha_fin` y bloqueo de edición
- PDF reutilizable (`PdfGenerator`) para cuarentena
- Endpoints `/api/compras/cuarentenas` y generación desde orden autorizada

**Frontend:**
- Listado, alta directa, edición de PROCESADO, detalle, completar y PDF
- Botón **Generar cuarentena** en órdenes autorizadas
- Filtros por código, proveedor, fecha, estado y origen

**Documentación:** Actualizados `06`, `08`

---

## [2026-09-10] — Compras: Órdenes de Compra

### Added

**Backend:**
- Tablas `orden_compras` y `detalle_orden_compra` (sin alta automática de animales; `animal_id` queda nulo)
- Models, factory, seeder (6 órdenes), Service con transiciones PENDIENTE → AUTORIZADA/RECHAZADA
- PDF reutilizable (`PdfGenerator` + DomPDF) para la orden de compra
- Permisos `compras.view|create|update|authorize` (trabajador: view+create; admin: todos)
- Notificación de órdenes pendientes en login/`me` para quien puede autorizar

**Frontend:**
- Módulo `modules/compras/` (listado, alta, edición de pendientes, detalle, PDF)
- Filtros por código, proveedor, fecha, estado y usuario
- Campana de notificaciones reutilizada: enlace a `/compras/ordenes-compra?estado=PENDIENTE`

**Documentación:** Actualizados `06`, `08`

---

## [2026-09-09] — Unificación Socios de Negocios

### Changed

- Listado único de socios (`/socios-de-negocio`) en lugar de menús separados de Clientes y Proveedores
- Filtros por razón social, CI/NIT, tipo (Cliente / Proveedor / Ambos) y estado
- Badges de tipo derivados de `personas_tipo`
- Formulario único para crear/editar con selección de uno o ambos tipos
- Menú: **Gestión de Personal → Socios de Negocios**

**Documentación:** Actualizados `06`, `08`

---

## [2026-09-06] — Socios de Negocio

### Added

**Backend:**
- Migración de tablas reutilizadas `tipo`, `personas` y `personas_tipo` (unique `persona_id + rol_id`)
- Models `TipoPersona` y `Persona` (soft delete, sin borrado físico)
- Factory + `TipoPersonaSeeder` (CLIENTE, PROVEEDOR) + `PersonaSeeder` (8 registros)
- `PersonaService` / `TipoPersonaService`, Policies, FormRequests, Resources y Controllers
- Endpoints `/api/socios` (CRUD + restore + estado) y `/api/tipos-persona`
- Permisos `socios.*` y `tipos_persona.*` (admin completo; trabajador/veterinario: view + create)

**Frontend:**
- Módulo `modules/socios-de-negocio/` con listados separados de Clientes y Proveedores
- MultiSelect de tipos; una persona puede ser cliente y proveedor a la vez
- Gestión de tipos de persona para administrador
- Integración en App, breadcrumbs y sidebar (Gestión de Personal)

**Documentación:** Actualizados `06`, `08`

---

## [2026-06-28] — Fase R4: Nacimientos

### Added

**Backend:**
- Migración `nacimientos` con FKs `parto_id`, `animal_id` (nullable) y `registrado_por` (nullable)
- Model `Nacimiento`, Factory, `NacimientoSeeder` (8 registros)
- `NacimientoService` con validación VIVO/MUERTO, causa_muerte obligatoria y animal_id prohibido en muertos
- Policy, Store/Update Requests, Resource (cadena parto→gestación→servicio→hembra/macho + animal + registrador), Controller
- 5 endpoints REST en `/api/nacimientos` (index, show, store, update — sin delete)
- Permisos existentes `reproduccion.view`, `reproduccion.create`, `reproduccion.update`
- Relación `hasMany nacimientos` en model `Parto`
- Eager loading completo para evitar N+1

**Frontend:**
- Módulo `modules/nacimientos/` con Selects de partos (resumen fecha + hembra), animales y usuarios
- Formulario condicional VIVO/MUERTO; animal opcional solo en vivos
- Listado y detalle muestran cadena reproductiva completa y datos del animal vinculado
- Edición permitida; sin eliminación (historial protegido)
- Rutas integradas en App + sidebar (grupo Reproducción) + breadcrumbs

**Documentación:** Actualizados `06`, `08`

---

## [2026-06-28] — Fase R3: Partos

### Added

**Backend:**
- Migración `partos` con FK `gestacion_id` → `gestaciones` (unique)
- Model `Parto`, Factory, `PartoSeeder` (6 registros)
- `PartoService` con validación de gestación existente, un parto por gestación y finalización automática de gestación
- Policy, Store/Update Requests, Resource (datos anidados de gestación y servicio), Controller
- 5 endpoints REST en `/api/partos` (index, show, store, update — sin delete)
- Permisos existentes `reproduccion.view`, `reproduccion.create`, `reproduccion.update`
- Relación `hasOne parto` en model `Gestacion`

**Frontend:**
- Módulo `modules/partos/` con Select de gestaciones (API)
- Listado y detalle muestran hembra, servicio, estado de gestación y fecha de parto
- Edición permitida; sin eliminación (historial protegido)
- Rutas integradas en App + sidebar (grupo Reproducción) + breadcrumbs

**Documentación:** Actualizados `06`, `08`

---

## [2026-06-28] — Fase R2: Gestaciones

### Added

**Backend:**
- Migración `gestaciones` con FK `servicio_id` → `servicios_reproductivos` (unique)
- Model `Gestacion`, Factory, `GestacionSeeder` (10 registros)
- `GestacionService` con validación de servicio existente, una gestación por servicio y una activa por servicio
- Policy, Store/Update Requests, Resource (datos anidados del servicio), Controller
- 5 endpoints REST en `/api/gestaciones` (index, show, store, update — sin delete)
- Permisos existentes `reproduccion.view`, `reproduccion.create`, `reproduccion.update`
- Relación `hasOne gestacion` en model `ServicioReproductivo`

**Frontend:**
- Módulo `modules/gestaciones/` con Select de servicios reproductivos (API)
- Listado y detalle muestran hembra, fecha, tipo y resultado del servicio
- Edición permitida; sin eliminación (historial protegido)
- Rutas integradas en App + sidebar (grupo Reproducción) + breadcrumbs

**Documentación:** Actualizados `06`, `08`

---

## [2026-06-28] — Fase R1: Servicios Reproductivos

### Added

**Backend:**
- Migración `servicios_reproductivos` con FKs `hembra_id` y `macho_id` (nullable) → `animales`
- Model `ServicioReproductivo`, Factory, `ServicioReproductivoSeeder` (10 registros)
- `ServicioReproductivoService` con validación de sexo (H/M), animal activo y macho opcional
- Policy, Store/Update Requests, Resource (`hembra_codigo`, `hembra_arete`, `macho_codigo`, `macho_arete`), Controller
- 5 endpoints REST en `/api/servicios-reproductivos` (index, show, store, update — sin delete)
- Permisos existentes `reproduccion.view`, `reproduccion.create`, `reproduccion.update`
- Relaciones `serviciosComoHembra` y `serviciosComoMacho` en model `Animal`

**Frontend:**
- Módulo `modules/servicios-reproductivos/` con Selects de hembras (sexo H) y machos (sexo M) activos
- Macho opcional; listado y detalle muestran código y arete
- Edición permitida; sin eliminación (historial protegido)
- Rutas integradas en App + sidebar (grupo Reproducción con HeartIcon) + breadcrumbs

**Documentación:** Actualizados `06`, `08`

---

## [2026-06-28] — Fase G1: Eventos Sanitarios

### Added

**Backend:**
- Migración `eventos_sanitarios` con FKs a `animales`, `tipos_eventos_sanitarios` y `vacunas` (nullable)
- Model `EventoSanitario` (append only, solo `created_at`), Factory, `EventoSanitarioSeeder` (10 registros)
- `EventoSanitarioService` con eager load, filtros y validación de animal/tipo/vacuna activos
- Vacuna obligatoria cuando el tipo es `VACUNACION` (`TipoEventoSanitario::requiereVacuna()`)
- Policy, `StoreEventoSanitarioRequest`, Resource (`animal_codigo`, `animal_arete`, `tipo_evento_nombre`, `vacuna_nombre`), Controller
- 3 endpoints REST en `/api/eventos-sanitarios` (index, show, store — sin update/delete)
- Permisos existentes `sanitario.view`, `sanitario.create` — ya asignados en roles
- Relación `hasMany eventosSanitarios` en model `Animal`

**Frontend:**
- Módulo `modules/eventos-sanitarios/` con Selects de animales, tipos y vacunas activos (API)
- Vacuna condicional según tipo de evento (obligatoria en vacunación)
- Listado y detalle muestran código/arete, nombre del tipo y nombre de vacuna
- Sin edición ni eliminación (historial append only)
- Rutas integradas en App + sidebar (grupo Sanidad con HeartIcon) + breadcrumbs

**Documentación:** Actualizados `06`, `08`

---

## [2026-06-28] — Fase G1: Pesajes

### Added

**Backend:**
- Migración `pesajes` con FK `animal_id → animales.id`, índices en `animal_id` y `fecha`
- Model `Pesaje` (append only, solo `created_at`), Factory, `PesajeSeeder` (10 registros)
- `PesajeService` con eager load de animal, filtros por animal/fecha y validación de animal activo
- Policy, `StorePesajeRequest` (peso > 0, fecha obligatoria), Resource (`animal_codigo`, `animal_arete`), Controller
- 3 endpoints REST en `/api/pesajes` (index, show, store — sin update/delete)
- Permisos `pesajes.view`, `pesajes.create` — en `administrador`, `veterinario` y `trabajador`
- Relación `hasMany pesajes` en model `Animal`

**Frontend:**
- Módulo `modules/pesajes/` con Select de animales activos (código y arete vía API)
- Listado y detalle muestran código y arete del animal (no ID)
- Sin edición ni eliminación (historial append only)
- Rutas integradas en App + sidebar (grupo Núcleo Ganadero) + breadcrumbs

**Documentación:** Actualizados `06`, `08`

---

## [2026-07-11] — Fase G1: Animales

### Added

**Backend:**
- Migración `animales` con FKs a razas, categorías, estados productivos, lotes y autorreferencias madre/padre
- Model `Animal`, Factory, `AnimalSeeder` (8 registros)
- `AnimalService` con eager load de relaciones, validación de capacidad del lote y soft delete
- Policy, Requests, Resource (nombres de relaciones), Controller
- 9 endpoints REST en `/api/animales`
- Permiso `animales.activate` — CRUD en `administrador`; permisos parciales en `veterinario` y `trabajador`
- Relación `hasMany animales` en model `Lote`

**Frontend:**
- Módulo `modules/animales/` con Selects de razas, categorías, estados productivos, lotes y padres activos (API)
- Listado y detalle muestran nombres de relaciones en lugar de IDs
- Rutas integradas en App + breadcrumbs (sidebar ya existente)

**Documentación:** Actualizados `06`, `08`

---

## [2026-07-11] — Fase I2.3: Lotes

### Added

**Backend:**
- Migración `lotes` con FK `potrero_id → potreros.id`
- Model `Lote` (BelongsTo Potrero), Factory, `LoteSeeder` (8 registros)
- `LoteService` con eager load de potrero, bloqueo de eliminación si hay animales asignados y validación de capacidad
- Policy, Requests, Resource (`potrero_nombre`), Controller
- 9 endpoints REST en `/api/lotes`
- Permisos `lotes.*` (restore/activate) — CRUD en `administrador`; `view` en `veterinario` y `trabajador`
- Relación `hasMany lotes` en model `Potrero`

**Frontend:**
- Módulo `modules/lotes/` con Select de potreros activos (API) en crear/editar
- Listado y detalle muestran nombre del potrero
- Rutas integradas en App + breadcrumbs (sidebar ya existente)

**Documentación:** Actualizados `06`, `08`

---

## [2026-07-08] — Fase I2.2: Potreros

### Added

**Backend:**
- Migración `potreros` con FK `establecimiento_id → establecimientos.id`
- Model `Potrero` (BelongsTo Establecimiento), Factory, `PotreroSeeder` (8 registros)
- `PotreroService` con eager load de establecimiento y bloqueo de eliminación si hay lotes asociados
- Policy, Requests, Resource (`establecimiento_nombre`), Controller
- 9 endpoints REST en `/api/potreros`
- Permisos `potreros.*` — CRUD en `administrador`; `view` en `veterinario` y `trabajador`
- Relación `hasMany potreros` en model `Establecimiento`

**Frontend:**
- Módulo `modules/potreros/` con Select de establecimientos activos (API) en crear/editar
- Listado y detalle muestran nombre del establecimiento
- Rutas integradas en App + sidebar + breadcrumbs

**Documentación:** Actualizados `06`, `08`

---

## [2026-07-07] — Fase I2.1: Establecimientos

### Added

**Backend:**
- Migración `establecimientos` (codigo, nombre, propietario, telefono, direccion, municipio, departamento, pais, area_total_ha, descripcion, activo, soft deletes)
- Model `Establecimiento`, Factory, `EstablecimientoSeeder` (8 registros de la spec y región)
- `EstablecimientoService` con validación de potreros asociados al eliminar
- Policy, Requests, Resource, Controller
- 9 endpoints REST en `/api/establecimientos`
- Permisos `establecimientos.*` — CRUD en `administrador`; `view` en `veterinario` y `trabajador`

**Frontend:**
- Módulo `modules/establecimientos/` (patrón idéntico a Razas, formulario extendido)
- Rutas integradas en App + sidebar (sección Infraestructura) + breadcrumbs

**Documentación:** Actualizados `06`, `08`

---

## [2026-07-06] — Fase G1.7: Tipos de Alerta

### Added

**Backend:**
- Migración `tipos_alertas` (patrón común: codigo, nombre, descripcion, activo, soft deletes)
- Model `TipoAlerta`, Factory, `TipoAlertaSeeder` (5 tipos: Vacunación pendiente, Peso bajo, Parto próximo, Animal enfermo, Servicio vencido)
- `TipoAlertaService`, Policy, Requests, Resource, Controller
- 9 endpoints REST en `/api/tipos-alertas`
- Permisos `tipos_alertas.*` — CRUD en `administrador`; `view` en `veterinario` y `trabajador`

**Frontend:**
- Módulo `modules/tipos-alertas/` (patrón idéntico a Razas)
- Rutas integradas en App + sidebar + breadcrumbs

**Documentación:** Actualizados `06`, `08`

---

## [2026-07-04] — Fase G1.6: Tipos de Movimiento

### Added

**Backend:**
- Migración `tipos_movimientos` (patrón común: codigo, nombre, descripcion, activo, soft deletes)
- Model `TipoMovimiento`, Factory, `TipoMovimientoSeeder` (6 tipos: Traslado, Compra, Venta, Nacimiento, Muerte, Baja)
- `TipoMovimientoService`, Policy, Requests, Resource, Controller
- 9 endpoints REST en `/api/tipos-movimientos`
- Permisos `tipos_movimientos.*` — CRUD en `administrador`; `view` en `veterinario` y `trabajador`

**Frontend:**
- Módulo `modules/tipos-movimientos/` (patrón idéntico a Razas)
- Rutas integradas en App + sidebar + breadcrumbs

**Documentación:** Actualizados `06`, `08`

---

## [2026-07-03] — Fase G1.5: Tipos de Eventos Sanitarios

### Added

**Backend:**
- Migración `tipos_eventos_sanitarios` (patrón común: codigo, nombre, descripcion, activo, soft deletes)
- Model `TipoEventoSanitario`, Factory, `TipoEventoSanitarioSeeder` (6 tipos de la spec)
- `TipoEventoSanitarioService`, Policy, Requests, Resource, Controller
- 9 endpoints REST en `/api/tipos-eventos-sanitarios`
- Permisos `tipos_eventos_sanitarios.*` — CRUD en `administrador`; `view` en `veterinario` y `trabajador`

**Frontend:**
- Módulo `modules/tipos-eventos-sanitarios/` (patrón idéntico a Razas)
- Rutas integradas en App + sidebar + breadcrumbs

**Documentación:** Actualizados `06`, `08`

---

## [2026-07-03] — Fase G1.4: Estados Productivos

### Added

**Backend:**
- Migración `estados_productivos` (patrón común: codigo, nombre, descripcion, activo, soft deletes)
- Model `EstadoProductivo`, Factory, `EstadoProductivoSeeder` (8 estados ganaderos)
- `EstadoProductivoService`, Policy, Requests, Resource, Controller
- 9 endpoints REST en `/api/estados-productivos`
- Permisos `estados_productivos.*` (6 permisos) — CRUD en `administrador`; `view` en `veterinario` y `trabajador`

**Frontend:**
- Módulo `modules/estados-productivos/` (patrón idéntico a Razas)
- Rutas integradas en App + sidebar + breadcrumbs

**Documentación:** Actualizados `06`, `08`

---

## [2026-06-28] — Fase G1.3: Vacunas

### Added

**Backend:**
- Migración `vacunas` (codigo, nombre, laboratorio, descripcion, activo, soft deletes)
- Model `Vacuna`, Factory, `VacunaSeeder` (10 vacunas ganaderas)
- `VacunaService`, Policy, Requests, Resource, Controller
- 9 endpoints REST en `/api/vacunas`
- Permisos `vacunas.*` (6 permisos) — asignados a `administrador` y `super-admin`; `vacunas.view` a `veterinario` y `trabajador`

**Frontend:**
- Módulo `modules/vacunas/` (patrón idéntico a Razas/Categorías)
- Rutas integradas en App + sidebar + breadcrumbs

**Documentación:** Actualizados `06`, `08`

---

## [2026-06-28] — Reorganización permanente de conocimiento

### Changed

- **Arquitectura de conocimiento:** convenciones permanentes → `.cursor/rules/` (4 reglas)
- **`docs/00_PROJECT_CONTEXT.md`** — contexto operativo mínimo (reemplaza `00_CONTEXTO_PROYECTO.md`)
- **`docs/02_DATABASE_SCHEMA.md`** — solo índice hacia `12_DATABASE/`
- **`docs/11_MODULE_TEMPLATE.md`** — checklist y flujo (sin duplicar rules)
- **`docs/06_MODULES_INDEX.md`**, **`docs/08_PROJECT_STATUS.md`** — versiones resumidas
- **`docs/README.md`** — guía de lectura para Agent

### Archived

- Documentos históricos movidos a `docs/_archive/` (arquitectura, standards, API detallada, roadmap, workflow)

---

## [2026-06-28] — Fase G1.2: Categorías de Animales

### Added

**Backend:**
- Migración `categorias_animales` (codigo, nombre, descripcion, activo, soft deletes)
- Model `CategoriaAnimal`, Factory, `CategoriaAnimalSeeder` (9 categorías reales)
- `CategoriaAnimalService`, Policy, Requests, Resource, Controller
- 9 endpoints REST en `/api/categorias-animales`
- Permisos `categorias_animales.*` (6 permisos) — asignados a `administrador` y `super-admin`

**Frontend:**
- Módulo `modules/categorias-animales/` (patrón idéntico a Razas)
- Rutas integradas en App + sidebar + breadcrumbs

**Documentación:** Actualizados `02`, `06`, `07`, `08`

### Notes

- Campo de estado: `activo` (vs `estado` en Razas) según especificación del módulo.
- Ejecutar `php artisan migrate` y seeders de permisos/categorías.

---

## [2026-06-28] — Fase G1: Módulo patrón Razas

### Added

**Backend:**
- Migración `razas` (nombre, codigo, descripcion, estado, soft deletes)
- Model `Raza`, Factory, `RazaSeeder` (10 razas reales)
- `RazaService`, `RazaPolicy`, `StoreRazaRequest`, `UpdateRazaRequest`, `RazaResource`
- `RazaController` en `Api/Razas/` — 9 endpoints REST
- Permisos `razas.restore`, `razas.activate` en PermissionSeeder

**Frontend:**
- Módulo completo `modules/razas/` (estructura patrón oficial)
- `PermissionGate` + `utils/permissions.ts`
- Persistencia de permisos en login (SignInForm)
- Rutas: `/razas`, `/razas/crear`, `/razas/:id`, `/razas/:id/editar`, `/razas/eliminados`

**Documentación:**
- `docs/11_MODULE_TEMPLATE.md` — plantilla obligatoria para módulos futuros
- Actualizados: `02`, `06`, `07`, `08`

### Notes

- Ejecutar `php artisan migrate` y `php artisan db:seed` para aplicar cambios.
- Re-login necesario para cargar permisos en localStorage.

---

## [2026-06-28] — Documentación reconstruida

### Added

- Reconstrucción completa de la carpeta `docs/` a partir del análisis del código del commit estable `50ab065`.
- Documentos creados:
  - `00_CONTEXTO_PROYECTO.md`
  - `01_ARCHITECTURE.md`
  - `02_DATABASE_SCHEMA.md`
  - `03_CODING_STANDARDS.md`
  - `04_PROJECT_RULES.md`
  - `05_API_CONVENTIONS.md`
  - `06_MODULES_INDEX.md`
  - `07_ROADMAP.md`
  - `08_PROJECT_STATUS.md`
  - `09_ARCHITECTURE_DECISIONS.md`
  - `10_DEVELOPMENT_WORKFLOW.md`
  - `CHANGELOG.md`

### Notes

- La documentación anterior se había perdido por corrupción de archivos.
- Fuente de verdad para la reconstrucción: código en `backend/`, `frontend/` y archivos de configuración.
- No se documentaron funcionalidades inexistentes.
- Corrección respecto a documentación previa: base de datos oficial es **PostgreSQL** (según `.env.example`), no MySQL.

---

## [2026-06-25] — Commit estable de referencia

### Added (código — commit `50ab065`)

**Mensaje:** Add login, gestion de usuario

**Backend:**
- Autenticación API: login, logout, me, change-password, register (403)
- RBAC: 43 permisos, 4 roles (Spatie Permission)
- CRUD usuarios completo con soft delete, restore, changeStatus
- UserPolicy, UserProtectionService
- FormRequests: StoreUserRequest, UpdateUserRequest
- UserResource
- Seeders: Permission, Role, User
- Migraciones: users, sanctum tokens, spatie permissions, soft deletes, cache, jobs

**Frontend:**
- Módulo `modules/user/`: listado, crear, editar, eliminados
- SignIn, ProtectedRoute, UserDropdown
- Cliente Axios con interceptor de token
- Layout TailAdmin con sidebar, dark mode
- Rutas demo TailAdmin

**Infraestructura:**
- Monorepo Laravel 12 + React 19
- PostgreSQL configurado en `.env.example`
- CORS para Vite dev server

---

## [Histórico anterior]

Commits anteriores a `50ab065` no analizados en esta reconstrucción.  
El commit `50ab065` representa el último estado estable conocido del repositorio al momento de la auditoría documental.
