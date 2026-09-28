# Catálogos

## Objetivo

Define las tablas maestras utilizadas por el sistema ganadero.
Los catálogos almacenan información de referencia utilizada por múltiples módulos del sistema.
Todos los catálogos siguen un patrón común para mantener consistencia en base de datos, backend y frontend.

---

# Convenciones generales

Motor:
PostgreSQL 17+

PK:
BIGINT Identity

SoftDeletes:
Sí

Estado lógico:
activo BOOLEAN DEFAULT TRUE

Auditoría:
created_at
updated_at
deleted_at

Orden recomendado:
nombre ASC

CRUD:
Completo

Permisos:
view
create
update
delete
restore
activate

---

# Patrón común

Todos los catálogos utilizan la siguiente estructura base:

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| codigo | VARCHAR(20) | UNIQUE, NOT NULL |
| nombre | VARCHAR(100) | NOT NULL |
| descripcion | TEXT | NULL |
| activo | BOOLEAN | DEFAULT TRUE |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | SoftDeletes |

Índices mínimos:

- codigo UNIQUE
- nombre
- activo

Reglas generales:

- No eliminar físicamente.
- Utilizar SoftDeletes.
- Código único.
- Nombre obligatorio.
- Activación/desactivación mediante estado lógico.
- Restauración permitida.
- No duplicar código.
- No duplicar nombre cuando esté activo.

---

# razas

## Propósito

Catálogo de razas bovinas.

## Campos

Patrón común.

## Relaciones

HasMany → animales

## Reglas

- No eliminar si existen animales asociados.
- Código único.
- Nombre único.

---

# categorias_animales

## Propósito

Clasificación productiva de animales.

Ejemplos:

- Ternero
- Vaquilla
- Toro
- Novillo
- Vaca
- Reproductor

## Campos

Patrón común.

## Relaciones

HasMany → animales

## Reglas

- No eliminar si existen animales asociados.

---

# estados_productivos

## Propósito

Estado productivo actual del animal.

Ejemplos:

- Producción
- Engorde
- Reproducción
- Seca
- Recría

## Campos

Patrón común.

## Relaciones

HasMany → animales

## Reglas

Solo un estado vigente por animal.

---

# presentaciones

## Propósito

Catálogo de presentaciones de medicamentos (Frasco, Ampolla, etc.).

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| descripcion | VARCHAR(50) | UNIQUE, NOT NULL |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | SoftDeletes |

## Relaciones

HasMany → medicamentos

## Reglas

Descripción obligatoria y única. No eliminar si hay medicamentos asociados.

---

# medicamentos

## Propósito

Catálogo de medicamentos utilizado por Sanidad (reemplaza el uso de `vacunas` en eventos sanitarios).

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| presentacion_id | BIGINT | FK |
| codigo | VARCHAR(20) | UNIQUE |
| nombre | VARCHAR(100) | NOT NULL |
| laboratorio | VARCHAR(120) | NULL |
| precio | DECIMAL(8,2) | NOT NULL |
| descripcion | TEXT | NOT NULL |
| activo | BOOLEAN | DEFAULT TRUE |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | SoftDeletes |

## Relaciones

BelongsTo → presentacion

HasMany → detalle_eventos_sanitarios

## Reglas

No eliminar si posee aplicaciones en eventos sanitarios. En selects de eventos solo aparecen medicamentos activos.

---

# vacunas

## Propósito

Catálogo legado de vacunas (ya no se usa en Eventos Sanitarios).

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| codigo | VARCHAR(20) | UNIQUE |
| nombre | VARCHAR(100) | NOT NULL |
| laboratorio | VARCHAR(120) | NULL |
| descripcion | TEXT | NULL |
| activo | BOOLEAN | DEFAULT TRUE |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | SoftDeletes |

## Relaciones

HasMany → (legado; Sanidad usa medicamentos)

## Reglas

No eliminar si posee aplicaciones registradas.

---

# tipos_eventos_sanitarios

## Propósito

Tipos de eventos sanitarios.

Ejemplos:

- Vacunación
- Desparasitación
- Tratamiento
- Enfermedad
- Cirugía
- Diagnóstico

## Campos

Patrón común.

## Relaciones

HasMany → eventos_sanitarios

---

# tipos_movimientos

## Propósito

Tipos de movimiento de animales.

Ejemplos:

- Traslado
- Compra
- Venta
- Nacimiento
- Muerte
- Baja

## Campos

Patrón común.

## Relaciones

HasMany → movimientos_animales

---

# tipos_alertas

## Propósito

Tipos de alertas automáticas del sistema.

Ejemplos:

- Vacunación pendiente
- Peso bajo
- Parto próximo
- Animal enfermo
- Servicio vencido

## Campos

Patrón común.

## Relaciones

HasMany → alertas

---

# tipos_salidas

## Propósito

Catálogo de motivos de salida de animales del establecimiento.

Tipos iniciales:

- Venta
- Perdido
- Robo
- Muerte

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| nombre | VARCHAR(100) | NOT NULL, UNIQUE |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | SoftDeletes |

## Relaciones

HasMany → `salidas.tipo_salida_id`

## Reglas

- Nombre obligatorio y único.
- No eliminar si existen salidas asociadas.
- SoftDeletes.

---

# Resumen

| Tabla | SoftDelete | Editable | Histórica |
|--------|------------|----------|-----------|
| razas | Sí | Sí | No |
| categorias_animales | Sí | Sí | No |
| estados_productivos | Sí | Sí | No |
| presentaciones | Sí | Sí | No |
| medicamentos | Sí | Sí | No |
| vacunas | Sí | Sí | No |
| tipos_eventos_sanitarios | Sí | Sí | No |
| tipos_movimientos | Sí | Sí | No |
| tipos_alertas | Sí | Sí | No |
| tipos_salidas | Sí | Sí | No |

---

# Patrón reutilizable

Todos los módulos de catálogos deben implementar la misma estructura.

## Backend

- Migration
- Model
- Factory
- Seeder
- Policy
- Service
- FormRequest (Store/Update)
- Resource
- Controller API

## Frontend

modules/{catalogo}/

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

GET /api/{catalogo}

POST /api/{catalogo}

GET /api/{catalogo}/{id}

PUT /api/{catalogo}/{id}

DELETE /api/{catalogo}/{id}

GET /api/{catalogo}/eliminados

POST /api/{catalogo}/{id}/restaurar

PATCH /api/{catalogo}/{id}/estado