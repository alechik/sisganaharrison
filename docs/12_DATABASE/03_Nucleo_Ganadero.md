# Núcleo Ganadero

## Objetivo

Define las entidades principales del sistema ganadero.

Estas tablas representan el ciclo de vida del animal y constituyen el núcleo funcional de la plataforma.

Toda la trazabilidad del ganado se construye sobre este dominio y soporta los requerimientos RF-04 a RF-15 mediante registros históricos append-only y reglas de negocio sobre `animales`.

El historial integral del animal (RF-05) se compone consultando `animal_eventos`, `pesajes`, `eventos_sanitarios`, `movimientos_animales` y, cuando aplique, su `nacimiento` asociado en el dominio Reproducción.

---

# Convenciones generales

Motor:
PostgreSQL 17+

PK:
BIGINT Identity

SoftDeletes:
Solo animales

Auditoría:
created_at
updated_at
deleted_at (solo animales)

Históricos:
Append Only

Permisos:
view
create
update
delete
restore
activate

---

# animales

## Propósito

Entidad principal del sistema.

Representa cada bovino registrado en el inventario ganadero (RF-04, RF-15).

Toda la información productiva, sanitaria, reproductiva y de movimientos depende de esta tabla.

Las crías nacidas muertas **no** generan registro aquí; se documentan únicamente en `nacimientos`.

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| codigo | VARCHAR(30) | UNIQUE, NOT NULL |
| arete | VARCHAR(30) | UNIQUE |
| nombre | VARCHAR(100) | NULL |
| sexo | CHAR(1) | CHECK (M,H) |
| fecha_nacimiento | DATE | NOT NULL |
| raza_id | BIGINT | FK |
| categoria_id | BIGINT | FK |
| estado_productivo_id | BIGINT | FK |
| lote_id | BIGINT | FK |
| madre_id | BIGINT | FK NULL |
| padre_id | BIGINT | FK NULL |
| color | VARCHAR(60) | NULL |
| observaciones | TEXT | NULL |
| user_id | BIGINT | FK |
| edad_inicial | INTEGER | NULL, meses |
| edad_actual | INTEGER | NULL, meses |
| precio_kilo | DECIMAL(12,2) | NULL; referencia de ingreso (`precio_compra` / `peso_ingreso`) |
| estado | VARCHAR(30) | ACTIVO, INGRESO POR COMPRA, RESERVADO, ENFERMO, MUERTO, VENDIDO, DESTETADO, OTRO |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | SoftDeletes |

## Relaciones

BelongsTo → raza

BelongsTo → categoria_animal

BelongsTo → estado_productivo

BelongsTo → lote

BelongsTo → madre

BelongsTo → padre

HasOne → nacimiento

HasMany → detalle_pesajes

HasManyThrough → eventos_sanitarios (vía detalle_eventos_sanitarios)

HasMany → movimientos_animales

HasMany → animal_eventos

HasMany → alertas

HasMany → indicadores_productivos

HasMany → servicios_reproductivos

## Claves Foráneas

raza_id → razas

categoria_id → categorias_animales

estado_productivo_id → estados_productivos

lote_id → lotes

madre_id → animales

padre_id → animales

## Índices

codigo UNIQUE

arete UNIQUE

raza_id

categoria_id

estado_productivo_id

lote_id

estado

## Reglas

- No eliminar físicamente.
- Código único.
- Un animal pertenece a un único lote.
- Solo un estado productivo vigente.
- Madre y padre son opcionales.
- Si proviene de un parto registrado, debe vincularse mediante `nacimientos.animal_id`.
- La fecha de nacimiento coincide con `partos.fecha_parto` del nacimiento asociado.
- Un animal con `estado != ACTIVO` no forma parte de las existencias operativas para venta (RF-15).
- Mortalidad y bajas del rodeo se registran mediante `movimientos_animales` y cambio de `estado` (RF-13).
- El arete puede originarse en `nacimientos.arete` cuando la cría proviene de un parto.
- `edad_inicial` y `edad_actual` se expresan siempre en meses.
- `precio_kilo` es opcional: se calcula y persiste al confirmar un Ingreso sobre el mismo `animal_id`; crías u otros orígenes pueden dejarlo nulo.
- Al registrar una venta pendiente el animal `ACTIVO` pasa a `RESERVADO`. No se marca `VENDIDO` hasta la salida definitiva.

## Trazabilidad derivada por animal

La siguiente información **no** se duplica en `animales`; se obtiene de tablas relacionadas:

| Dato | Fuente |
|------|--------|
| Origen | `nacimientos` (NACIMIENTO) o primer `movimientos_animales` tipo Compra |
| Destino | último `movimientos_animales` tipo Venta (`destino_externo`) |
| Propietario interno | establecimiento del `lote_id` vigente |
| Propietario/contraparte externa | `movimientos_animales.contraparte` |
| Fecha de ingreso | `partos.fecha_parto` (nacimiento) o fecha del movimiento Compra |
| Fecha de salida | fecha del movimiento Venta, Muerte o Baja |
| Motivo de salida | `movimientos_animales.motivo` |
| Precio de movimiento (compra/venta) | `movimientos_animales.valor` |

---

# animal_eventos

## Propósito

Bitácora general del animal.

Centraliza todos los eventos importantes de su ciclo de vida y compone el historial completo del animal (RF-05).

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| animal_id | BIGINT | FK |
| tipo | VARCHAR(50) | NOT NULL |
| fecha | DATE | NOT NULL |
| descripcion | TEXT | NULL |
| metadata | JSONB | NULL |
| created_at | TIMESTAMP | |

Ejemplos de `tipo`:

- NACIMIENTO
- TRASLADO
- COMPRA
- VENTA
- MORTALIDAD
- BAJA
- CAMBIO_CATEGORIA
- CAMBIO_ESTADO_PRODUCTIVO

## Relaciones

BelongsTo → animal

## Claves Foráneas

animal_id → animales

## Índices

animal_id

tipo

fecha

## Reglas

- Append Only.
- Nunca modificar.
- Nunca eliminar.
- Representa la trazabilidad histórica.
- Complementa, no reemplaza, las tablas especializadas (`movimientos_animales`, `eventos_sanitarios`, `nacimientos`).
- Se genera automáticamente al registrar movimientos de ingreso, salida, traslado o cambios relevantes.

---

# pesajes

Cabecera de una sesión de pesaje (manual o automática). Código correlativo `PES-{año}-####`.

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| codigo_pesaje | VARCHAR(20) | UNIQUE, NOT NULL |
| fecha_pesaje | DATE | NOT NULL |
| total_peso | DECIMAL(8,2) | NOT NULL; suma del detalle |
| observacion | TEXT | NULL |
| user_id | BIGINT | FK users |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

## Relaciones

BelongsTo → usuario

HasMany → detalle_pesajes

# detalle_pesajes

Peso de un animal dentro de una sesión. Trazabilidad Pesaje → Detalle → Animal → Lote.

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| pesaje_id | BIGINT | FK |
| animal_id | BIGINT | FK, unique por pesaje |
| lote_id | BIGINT | FK NULL |
| peso | DECIMAL(8,2) | NOT NULL |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

## Reglas

- Un pesaje tiene de 1 a N animales.
- No repetir el mismo animal en el mismo pesaje.
- `total_peso` = suma de `detalle_pesajes.peso`.
- Un ingreso confirmado genera **un** pesaje con todos sus animales. Observación: `Pesaje generado por Ingreso: {codigo}`.
- Un nacimiento VIVO con peso genera un pesaje. Observación: `Pesaje generado por Nacimiento - Parto: PAR-{id}`.
- Un nacimiento MUERTO no genera pesaje.

---

# movimientos_animales

## Propósito

Registro unificado de movimientos del animal.

Soporta:

- Traslados internos entre lotes (RF-10, RF-11).
- Ingresos al inventario por compra (RF-14).
- Salidas del inventario por venta, muerte o pérdida (RF-13, RF-14).
- Trazabilidad de origen, destino, propietario, fechas y precio.

Los tipos de movimiento se obtienen del catálogo `tipos_movimientos`.

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| animal_id | BIGINT | FK |
| lote_origen_id | BIGINT | FK, NULL |
| lote_destino_id | BIGINT | FK, NULL |
| tipo_movimiento_id | BIGINT | FK |
| fecha | DATE | NOT NULL |
| valor | NUMERIC(12,2) | NULL |
| contraparte | VARCHAR(150) | NULL |
| origen_externo | VARCHAR(150) | NULL |
| destino_externo | VARCHAR(150) | NULL |
| documento_referencia | VARCHAR(60) | NULL |
| motivo | VARCHAR(150) | NULL |
| observaciones | TEXT | NULL |
| registrado_por | BIGINT | FK, NULL |
| created_at | TIMESTAMP | |

## Relaciones

BelongsTo → animal

BelongsTo → lote origen

BelongsTo → lote destino

BelongsTo → tipo_movimiento

BelongsTo → user (registrado_por)

## Claves Foráneas

animal_id → animales

lote_origen_id → lotes

lote_destino_id → lotes

tipo_movimiento_id → tipos_movimientos

registrado_por → users.id

## Índices

animal_id

fecha

lote_destino_id

tipo_movimiento_id

registrado_por

## Reglas

- Append Only.
- No modificar movimientos históricos.

### Traslado (RF-10, RF-11)

- Actualiza `animales.lote_id` al `lote_destino_id`.
- **No modifica** el inventario global.
- Genera `animal_eventos` de tipo TRASLADO.
- La ubicación histórica se reconstruye con la secuencia de traslados.

### Compra (RF-14 — ingreso)

- Registra ingreso al inventario.
- `lote_destino_id` es obligatorio.
- `origen_externo` identifica procedencia externa.
- `contraparte` identifica vendedor o propietario anterior.
- `valor` registra precio de compra.
- Activa el animal (`activo = true`).
- Genera `animal_eventos` de tipo COMPRA.

### Venta (RF-14 — salida)

- Registra salida del inventario.
- `lote_origen_id` registra ubicación al momento de la venta.
- `destino_externo` identifica destino externo.
- `contraparte` identifica comprador.
- `valor` registra precio de venta.
- `motivo` puede registrar motivo comercial u observación de salida.
- Desactiva el animal (`activo = false`).
- Genera `animal_eventos` de tipo VENTA.

### Muerte (RF-13 — salida)

- Registra salida por mortalidad del rodeo.
- `motivo` registra la causa de muerte.
- `observaciones` amplía el detalle.
- `registrado_por` identifica responsable cuando aplique.
- Desactiva el animal (`activo = false`).
- Genera `animal_eventos` de tipo MORTALIDAD.

### Baja / Pérdida (RF-13 — salida)

- Registra salida por pérdida, robo, extraviado u otro motivo no comercial.
- `motivo` registra el motivo de la baja.
- Desactiva el animal (`activo = false`).
- Genera `animal_eventos` de tipo BAJA.

### Nacimiento

- El ingreso por nacimiento se origina en `nacimientos` + alta del animal.
- Un movimiento tipo Nacimiento es opcional y complementario; no es la fuente principal del ingreso.

---

# eventos_sanitarios

## Propósito

Cabecera del registro sanitario (RF-08, RF-09). Un evento puede incluir 1 a N animales.

No hay flujo de autorización.

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| tipo_evento_id | BIGINT | FK |
| user_id | BIGINT | FK |
| fecha | DATE | NOT NULL |
| diagnostico | TEXT | NULL |
| tratamiento | TEXT | NULL |
| total | DECIMAL(10,2) | NOT NULL — suma de precios de detalle |
| observaciones | TEXT | NULL |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

## Relaciones

BelongsTo → tipo_evento_sanitario

BelongsTo → user

HasMany → detalle_eventos_sanitarios

## Claves Foráneas

tipo_evento_id → tipos_eventos_sanitarios

user_id → users

## Índices

fecha

tipo_evento_id

user_id

## Reglas

- Append only.
- Cabecera y detalles se crean en una transacción.
- `total` lo calcula el backend a partir de `detalle_eventos_sanitarios.precio_medicamento`.
- Roles `trabajador` y `veterinario` pueden registrar (`sanitario.create`).

---

# detalle_eventos_sanitarios

## Propósito

Captura histórica de cada animal en el evento (lote y peso al momento del registro).

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| evento_sanitario_id | BIGINT | FK |
| animal_id | BIGINT | FK |
| lote_id | BIGINT | FK NULL (histórico) |
| medicamento_id | BIGINT | FK |
| peso_animal | DECIMAL(8,2) | NOT NULL — snapshot |
| precio_medicamento | DECIMAL(8,2) | NOT NULL — snapshot |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

## Relaciones

BelongsTo → evento_sanitario

BelongsTo → animal

BelongsTo → lote (valor almacenado, no el lote vigente del animal)

BelongsTo → medicamento

## Claves Foráneas

evento_sanitario_id → eventos_sanitarios

animal_id → animales

lote_id → lotes

medicamento_id → medicamentos

## Índices

evento_sanitario_id

animal_id

UNIQUE (evento_sanitario_id, animal_id)

## Reglas

- El lote y el peso se copian del estado actual del animal (último `detalle_pesajes`).
- Un cambio posterior de lote o peso del animal no modifica este detalle.
- El precio se copia del medicamento activo al momento del evento.

---

# Inventario ganadero (RF-15)

El inventario **no** requiere tabla propia. Se calcula a partir de `animales`, `nacimientos` y `movimientos_animales`.

## Existencia vigente

Animales con:

- `estado = ACTIVO`
- `deleted_at IS NULL`

## Ingresos al inventario

| Origen | Fuente | Condición |
|--------|--------|-----------|
| Nacimiento | `nacimientos` + alta en `animales` | `estado_nacimiento = VIVO` y `animal_id` vinculado |
| Compra | `movimientos_animales` | tipo Compra |

## Salidas del inventario

| Motivo | Fuente | Condición |
|--------|--------|-----------|
| Venta | `movimientos_animales` | tipo Venta |
| Muerte | `movimientos_animales` | tipo Muerte |
| Pérdida | `movimientos_animales` | tipo Baja |

## Movimientos que NO alteran inventario

- Traslado entre lotes.
- Cambios de categoría o estado productivo.
- Registros sanitarios y pesajes.

## Mortalidad al nacer

- Se registra en `nacimientos` con `estado_nacimiento = MUERTO`.
- No genera animal ni modifica existencias vigentes.
- Cuenta para indicadores de natalidad y mortalidad perinatal.

---

# ventas

Venta de animales (`PENDIENTE` | `AUTORIZADA` | `ANULADA`). El trabajador registra; gerencia autoriza o anula. Al crear, los animales `ACTIVO` pasan a `RESERVADO`. No se marca `VENDIDO` en la autorización (queda para Salidas).

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| cliente_id | BIGINT | FK personas |
| user_id | BIGINT | FK users |
| cod_venta | VARCHAR(20) | UNIQUE |
| fecha_venta | DATE | NOT NULL |
| estado | VARCHAR(50) | PENDIENTE, AUTORIZADA, ANULADA |
| descuento | DECIMAL(8,2) | DEFAULT 0 |
| total_peso | DECIMAL(8,2) | NULL |
| monto_total | DECIMAL(8,2) | NULL |
| autorizado_por | BIGINT | FK users, NULL |
| fecha_decision | TIMESTAMP | NULL |
| observacion_estado | VARCHAR(255) | NULL |

# detalle_ventas

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| venta_id | BIGINT | FK |
| animal_id | BIGINT | FK, unique por venta |
| cantidad | INTEGER | DEFAULT 1 |
| peso | DECIMAL(8,2) | |
| lote_id | BIGINT | FK NULL |
| precio | DECIMAL(8,2) | |
| descuento | DECIMAL(8,2) | DEFAULT 0 |
| subtotal | DECIMAL(8,2) | |

---

# salidas

Salida definitiva de animales (`REGISTRADO`). Si el tipo es Venta, toma una venta `AUTORIZADA` y marca los animales como `VENDIDO`. Otros tipos (Perdido, Robo, Muerte) no usan `venta_id`.

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| cliente_id | BIGINT | FK personas, NULL |
| user_id | BIGINT | FK users |
| venta_id | BIGINT | FK ventas, NULL, UNIQUE |
| tipo_salida_id | BIGINT | FK tipos_salidas |
| codigo | VARCHAR(20) | UNIQUE |
| fecha_salida | DATE | NOT NULL |
| estado | VARCHAR(50) | REGISTRADO |
| descuento | DECIMAL(8,2) | DEFAULT 0 |
| total_peso | DECIMAL(8,2) | NULL |
| monto_total | DECIMAL(8,2) | NULL |

# detalle_salidas

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| salida_id | BIGINT | FK |
| animal_id | BIGINT | FK, UNIQUE (un animal solo puede salir una vez) |
| cantidad | INTEGER | DEFAULT 1 |
| peso | DECIMAL(8,2) | |
| lote_id | BIGINT | FK NULL |
| precio | DECIMAL(8,2) | |
| descuento | DECIMAL(8,2) | DEFAULT 0 |
| subtotal | DECIMAL(8,2) | |

Estados de animal al confirmar: Venta → `VENDIDO`; Muerte → `MUERTO`; Robo/Perdido → `OTRO`.

---

# Resumen

| Tabla | SoftDelete | Editable | Histórica |
|--------|------------|----------|-----------|
| animales | Sí | Sí | No |
| animal_eventos | No | No | Sí |
| pesajes | No | No | Sí |
| movimientos_animales | No | No | Sí |
| eventos_sanitarios | No | No | Sí |
| detalle_eventos_sanitarios | No | No | Sí |

---

# Relaciones principales

Razas
        │
Categorías
        │
Estados Productivos
        │
Lotes
        │
        ▼
     Animales
        │
 ├──────────────► Pesajes
 ├──────────────► Eventos Sanitarios
 ├──────────────► Movimientos
 ├──────────────► Animal Eventos
 ├──────────────► Alertas
 ├──────────────► Indicadores
 ├──────────────► Reproducción
 └──────────────► Nacimiento (opcional)

Reproducción
        │
        ▼
    Nacimientos ──► Animales (solo VIVO, vinculación posterior)

---

# Cobertura funcional

| RF | Soporte en el modelo |
|----|----------------------|
| RF-04 Registro de ganado | `animales` |
| RF-05 Historial completo | `animal_eventos`, `pesajes`, `movimientos_animales`, `eventos_sanitarios`, `nacimientos` |
| RF-08 Registro sanitario | `eventos_sanitarios` |
| RF-09 Historial sanitario | `eventos_sanitarios` (append-only) |
| RF-10 Movimientos | `movimientos_animales` + `tipos_movimientos` |
| RF-11 Ubicación histórica | `movimientos_animales` (lote origen/destino) |
| RF-12 Control de nacimientos | `partos` + `nacimientos` (dominio Reproducción) |
| RF-13 Mortalidad y pérdidas | `nacimientos` (al nacer) + `movimientos_animales` Muerte/Baja |
| RF-14 Compras y ventas | `movimientos_animales` + campos comerciales y de trazabilidad |
| RF-15 Existencias | `animales.activo` + reglas de inventario documentadas |

---

# Dependencias

Este dominio depende de:

- Plataforma
- Catálogos
- Infraestructura

Y es utilizado por:

- Reproducción
- Gestión
- Reportes
- Dashboard
- Alertas

No deben existir registros huérfanos.

Toda la integridad se controla mediante claves foráneas y reglas de negocio.

---

# Patrón reutilizable

## Backend

- Migration
- Model
- Factory
- Seeder (cuando aplique)
- Policy
- Service
- FormRequest
- Resource
- Controller API

## Frontend

modules/{modulo}/

- pages/
- components/
- hooks/
- services/
- types/
- utils/
- routes/
- permissions/
- constants/
- index.ts

## API REST

GET /api/{modulo}

POST /api/{modulo}

GET /api/{modulo}/{id}

PUT /api/{modulo}/{id}

DELETE /api/{modulo}/{id}

GET /api/{modulo}/eliminados

POST /api/{modulo}/{id}/restaurar

PATCH /api/{modulo}/{id}/estado
