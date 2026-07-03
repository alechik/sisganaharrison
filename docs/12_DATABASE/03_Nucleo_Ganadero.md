# Núcleo Ganadero

## Objetivo

Define las entidades principales del sistema ganadero.

Estas tablas representan el ciclo de vida del animal y constituyen el núcleo funcional de la plataforma.

Toda la trazabilidad del ganado se construye sobre este dominio.

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

Representa cada bovino registrado.

Toda la información productiva, sanitaria, reproductiva y de movimientos depende de esta tabla.

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
| activo | BOOLEAN | DEFAULT TRUE |
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

HasMany → pesajes

HasMany → eventos_sanitarios

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

activo

## Reglas

No eliminar físicamente.

Código único.

Un animal pertenece a un único lote.

Solo un estado productivo vigente.

Madre y padre son opcionales.

---

# animal_eventos

## Propósito

Bitácora general del animal.

Centraliza todos los eventos importantes de su ciclo de vida.

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

## Relaciones

BelongsTo → animal

## Claves Foráneas

animal_id → animales

## Índices

animal_id

tipo

fecha

## Reglas

Append Only.

Nunca modificar.

Nunca eliminar.

Representa la trazabilidad histórica.

---

# pesajes

## Propósito

Historial de peso del animal.

Permite calcular indicadores productivos.

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| animal_id | BIGINT | FK |
| fecha | DATE | NOT NULL |
| peso | NUMERIC(8,2) | NOT NULL |
| observaciones | TEXT | NULL |
| created_at | TIMESTAMP | |

## Relaciones

BelongsTo → animal

## Claves Foráneas

animal_id → animales

## Índices

animal_id

fecha

## Reglas

Append Only.

Nunca actualizar.

Nunca eliminar.

---

# movimientos_animales

## Propósito

Historial de movimientos entre lotes.

Permite conocer la ubicación histórica del animal.

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| animal_id | BIGINT | FK |
| lote_origen_id | BIGINT | FK |
| lote_destino_id | BIGINT | FK |
| tipo_movimiento_id | BIGINT | FK |
| fecha | DATE | NOT NULL |
| observaciones | TEXT | NULL |
| created_at | TIMESTAMP | |

## Relaciones

BelongsTo → animal

BelongsTo → lote origen

BelongsTo → lote destino

BelongsTo → tipo_movimiento

## Claves Foráneas

animal_id → animales

lote_origen_id → lotes

lote_destino_id → lotes

tipo_movimiento_id → tipos_movimientos

## Índices

animal_id

fecha

lote_destino_id

## Reglas

Append Only.

No modificar movimientos históricos.

Todo movimiento cambia el lote actual del animal.

---

# eventos_sanitarios

## Propósito

Registro sanitario del animal.

Incluye vacunaciones, tratamientos, enfermedades y controles.

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| animal_id | BIGINT | FK |
| tipo_evento_id | BIGINT | FK |
| vacuna_id | BIGINT | FK NULL |
| fecha | DATE | NOT NULL |
| diagnostico | TEXT | NULL |
| tratamiento | TEXT | NULL |
| observaciones | TEXT | NULL |
| created_at | TIMESTAMP | |

## Relaciones

BelongsTo → animal

BelongsTo → vacuna

BelongsTo → tipo_evento_sanitario

## Claves Foráneas

animal_id → animales

vacuna_id → vacunas

tipo_evento_id → tipos_eventos_sanitarios

## Índices

animal_id

fecha

tipo_evento_id

## Reglas

Append Only.

No eliminar historial sanitario.

Vacuna opcional según el tipo de evento.

---

# Resumen

| Tabla | SoftDelete | Editable | Histórica |
|--------|------------|----------|-----------|
| animales | Sí | Sí | No |
| animal_eventos | No | No | Sí |
| pesajes | No | No | Sí |
| movimientos_animales | No | No | Sí |
| eventos_sanitarios | No | No | Sí |

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
 └──────────────► Reproducción

---

# Dependencias

Este dominio depende de:

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