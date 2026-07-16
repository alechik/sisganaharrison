# Gestión

## Objetivo

Define las tablas encargadas de la supervisión, monitoreo, indicadores, alertas y generación de información estratégica del sistema ganadero.

Este dominio consolida la información generada por el resto de módulos para apoyar la toma de decisiones operativas y gerenciales (RF-15 a RF-18).

No introduce tablas de inventario ni de movimientos; consume los datos transaccionales de Núcleo Ganadero y Reproducción.

---

# Convenciones generales

Motor:
PostgreSQL 17+

PK:
BIGINT Identity

SoftDeletes:
No

Auditoría:
created_at
updated_at

Históricos:
Append Only

Permisos:
view
create
update
delete

---

# alertas

## Propósito

Registra las alertas generadas automáticamente o manualmente para los animales y procesos del sistema.

Permite realizar seguimiento de eventos que requieren atención.

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| animal_id | BIGINT | FK, NULL |
| tipo_alerta_id | BIGINT | FK, NOT NULL |
| titulo | VARCHAR(150) | NOT NULL |
| descripcion | TEXT | NULL |
| prioridad | VARCHAR(20) | DEFAULT 'Media' |
| fecha_generacion | TIMESTAMP | NOT NULL |
| fecha_vencimiento | DATE | NULL |
| atendida | BOOLEAN | DEFAULT FALSE |
| fecha_atencion | TIMESTAMP | NULL |
| observaciones | TEXT | NULL |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

## Relaciones

BelongsTo → animal

BelongsTo → tipo_alerta

## Claves Foráneas

animal_id → animales.id

tipo_alerta_id → tipos_alertas.id

## Índices

- animal_id
- tipo_alerta_id
- atendida
- prioridad
- fecha_vencimiento

## Reglas

- Las alertas nunca se eliminan físicamente.
- Una alerta puede cerrarse únicamente marcándola como atendida.
- El historial debe conservarse.
- Pueden generarse alertas por parto próximo (gestaciones), vacunación pendiente, peso bajo, mortalidad reciente y existencia por lote.

---

# indicadores_productivos

## Propósito

Almacena indicadores calculados para cada animal o proceso productivo.

Los indicadores son generados automáticamente a partir de la información registrada en el sistema (RF-18).

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| animal_id | BIGINT | FK, NULL |
| fecha_calculo | DATE | NOT NULL |
| ganancia_peso | NUMERIC(10,2) | NULL |
| edad_meses | INTEGER | NULL |
| dias_gestacion | INTEGER | NULL |
| indice_productivo | NUMERIC(8,2) | NULL |
| metadata | JSONB | NULL |
| created_at | TIMESTAMP | |

El campo `metadata` puede almacenar indicadores agregados sin duplicar tablas, por ejemplo:

- `establecimiento_id`
- `lote_id`
- `total_existencias`
- `ingresos_nacimiento`
- `ingresos_compra`
- `salidas_venta`
- `salidas_muerte`
- `salidas_perdida`
- `natalidad_periodo`
- `mortalidad_periodo`
- `tasa_mortalidad`
- `compras_periodo`
- `ventas_periodo`

## Relaciones

BelongsTo → animal

## Claves Foráneas

animal_id → animales.id

## Índices

- animal_id
- fecha_calculo

## Reglas

- Tabla histórica.
- Cada cálculo genera un nuevo registro.
- Nunca actualizar indicadores históricos.
- Nunca eliminar registros.
- `animal_id` NULL indica indicador agregado (establecimiento, lote o global) almacenado en `metadata`.
- Fuentes de cálculo: `animales`, `pesajes`, `gestaciones`, `nacimientos`, `movimientos_animales`, `eventos_sanitarios`.

---

# reportes_generados

## Propósito

Registra el historial de reportes generados por los usuarios.

Permite controlar la generación y descarga de información del sistema (RF-16, RF-17).

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| usuario_id | BIGINT | FK |
| nombre | VARCHAR(150) | NOT NULL |
| tipo | VARCHAR(50) | NOT NULL |
| parametros | JSONB | NULL |
| formato | VARCHAR(20) | NOT NULL |
| archivo | VARCHAR(255) | NULL |
| generado_en | TIMESTAMP | NOT NULL |
| created_at | TIMESTAMP | |

Ejemplos de `tipo`:

- EXISTENCIAS
- MOVIMIENTOS
- SANITARIO
- REPRODUCCION
- NATALIDAD
- MORTALIDAD
- COMPRAS_VENTAS
- INDICADORES
- HISTORIAL_ANIMAL

Ejemplos de `formato`:

- PDF
- XLSX
- CSV

## Relaciones

BelongsTo → user

## Claves Foráneas

usuario_id → users.id

## Índices

- usuario_id
- tipo
- generado_en

## Reglas

- Tabla histórica.
- Nunca modificar registros.
- Mantener trazabilidad de todos los reportes generados.
- Soporta exportaciones mediante el campo `archivo` y `formato` (RF-17).

---

# Resumen

| Tabla | SoftDelete | Editable | Histórica |
|--------|------------|----------|-----------|
| alertas | No | Sí | Sí |
| indicadores_productivos | No | No | Sí |
| reportes_generados | No | No | Sí |

---

# Relaciones principales

Animales
    │
    ├────────────► Alertas
    │
    ├────────────► Indicadores Productivos
    │
    ▼
Dashboard

Nacimientos
    │
    └────────────► Indicadores / Reportes (natalidad, mortalidad al nacer)

Movimientos Animales
    │
    └────────────► Indicadores / Reportes (compras, ventas, mortalidad, pérdidas)

Usuarios
    │
    ▼
Reportes Generados

---

# Cobertura funcional

| RF | Soporte en el modelo |
|----|----------------------|
| RF-15 Control de existencias | Cálculo sobre `animales`, `nacimientos` y `movimientos_animales` |
| RF-16 Reportes | `reportes_generados` + consultas transaccionales |
| RF-17 Exportaciones | `reportes_generados.formato` + `archivo` |
| RF-18 Dashboard e indicadores | `indicadores_productivos` + `alertas` + agregaciones en `metadata` |

---

# Reglas de cálculo — existencias (RF-15)

## Existencia vigente

Animales con `activo = true` y sin `deleted_at`.

## Agrupaciones

- **Por ubicación:** `lote_id` → `potrero_id` → `establecimiento_id`.
- **Por clasificación:** `categoria_id`, `sexo`, `raza_id`, `estado_productivo_id`.

## Ingresos

| Tipo | Fuente |
|------|--------|
| Nacimiento | `nacimientos` con `estado_nacimiento = VIVO` y `animal_id` vinculado |
| Compra | `movimientos_animales` con tipo Compra |

## Salidas

| Tipo | Fuente |
|------|--------|
| Venta | `movimientos_animales` con tipo Venta |
| Muerte | `movimientos_animales` con tipo Muerte |
| Pérdida | `movimientos_animales` con tipo Baja |

## Movimientos excluidos del inventario

- Traslados internos entre lotes.
- Registros sanitarios, pesajes y eventos informativos.

## Indicadores complementarios

- **Natalidad:** contar `nacimientos` VIVO en el período.
- **Mortalidad al nacer:** contar `nacimientos` MUERTO en el período.
- **Mortalidad del rodeo:** contar movimientos tipo Muerte.
- **Pérdidas:** contar movimientos tipo Baja.
- **Compras / Ventas:** contar y sumar `valor` por tipo.

---

# Reglas de cálculo — dashboard (RF-18)

- Ganancia de peso: derivada de `pesajes`.
- Edad: derivada de `animales.fecha_nacimiento`.
- Gestación: derivada de `gestaciones`.
- Productividad reproductiva: derivada de `servicios_reproductivos`, `gestaciones`, `partos` y `nacimientos`.
- Inventario histórico: snapshots en `indicadores_productivos.metadata`.
- No crear tablas de resumen; persistir snapshots calculados cuando se requiera histórico de dashboard.

---

# Dependencias

Este dominio depende de:

- Plataforma
- Catálogos
- Núcleo Ganadero
- Reproducción

Y es utilizado por:

- Dashboard
- Reportes
- BI (Business Intelligence)
- Estadísticas
- Exportaciones

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
