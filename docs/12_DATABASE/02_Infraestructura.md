# Infraestructura

## Objetivo

Define la estructura física donde se desarrolla la actividad ganadera.

Estas tablas representan la organización jerárquica del establecimiento y son utilizadas por los módulos de animales, movimientos, reproducción, sanidad y reportes.

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

CRUD:
Completo

Permisos:
view
create
update
delete
restore
activate

Jerarquía:

Establecimiento
└── Potrero
    └── Lote

---

# establecimientos

## Propósito

Representa una unidad productiva o propiedad ganadera.

Ejemplos:

- Hacienda El Carmen
- Estancia San José
- Agropecuaria Harrison

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| codigo | VARCHAR(20) | UNIQUE, NOT NULL |
| nombre | VARCHAR(150) | NOT NULL |
| propietario | VARCHAR(150) | NULL |
| telefono | VARCHAR(30) | NULL |
| direccion | VARCHAR(255) | NULL |
| municipio | VARCHAR(100) | NULL |
| departamento | VARCHAR(100) | NULL |
| pais | VARCHAR(100) | DEFAULT 'Bolivia' |
| area_total_ha | NUMERIC(10,2) | NULL |
| descripcion | TEXT | NULL |
| activo | BOOLEAN | DEFAULT TRUE |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | SoftDeletes |

## Relaciones

HasMany → potreros

## Índices

- codigo UNIQUE
- nombre
- activo

## Reglas

- No eliminar si existen potreros asociados.
- Código único.
- Nombre obligatorio.

---

# potreros

## Propósito

División física del establecimiento destinada al pastoreo.

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| establecimiento_id | BIGINT | FK, NOT NULL |
| codigo | VARCHAR(20) | UNIQUE, NOT NULL |
| nombre | VARCHAR(100) | NOT NULL |
| area_ha | NUMERIC(10,2) | NULL |
| tipo_pasto | VARCHAR(100) | NULL |
| disponibilidad | BOOLEAN | DEFAULT TRUE |
| descripcion | TEXT | NULL |
| activo | BOOLEAN | DEFAULT TRUE |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | SoftDeletes |

## Relaciones

BelongsTo → establecimiento

HasMany → lotes

## Claves Foráneas

establecimiento_id → establecimientos.id

## Índices

- establecimiento_id
- codigo UNIQUE
- nombre
- activo

## Reglas

- No eliminar si existen lotes asociados.
- Debe pertenecer a un establecimiento.
- Código único.

---

# lotes

## Propósito

Unidad operativa donde se agrupan animales.

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| potrero_id | BIGINT | FK, NOT NULL |
| codigo | VARCHAR(20) | UNIQUE, NOT NULL |
| nombre | VARCHAR(100) | NOT NULL |
| capacidad_animales | INTEGER | DEFAULT 0 |
| area_ha | NUMERIC(10,2) | NULL |
| observaciones | TEXT | NULL |
| activo | BOOLEAN | DEFAULT TRUE |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | SoftDeletes |

## Relaciones

BelongsTo → potrero

HasMany → animales

HasMany → movimientos_animales

## Claves Foráneas

potrero_id → potreros.id

## Índices

- potrero_id
- codigo UNIQUE
- nombre
- activo

## Reglas

- No eliminar si existen animales asignados.
- No superar la capacidad definida.
- Todo lote pertenece a un potrero.

---

# Resumen

| Tabla | SoftDelete | Editable | Histórica |
|--------|------------|----------|-----------|
| establecimientos | Sí | Sí | No |
| potreros | Sí | Sí | No |
| lotes | Sí | Sí | No |

---

# Relaciones principales

establecimientos (1)
        │
        │
        ▼
potreros (N)
        │
        │
        ▼
lotes (N)
        │
        ├────────► animales
        │
        └────────► movimientos_animales

---

# Dependencias

Los módulos de infraestructura son utilizados por:

- Animales
- Movimientos
- Reproducción
- Sanidad
- Alertas
- Indicadores
- Reportes

No deben existir registros huérfanos.

Todas las relaciones utilizan claves foráneas con integridad referencial.

---

# Patrón reutilizable

Todos los módulos de infraestructura deben implementar la misma estructura.

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

modules/{infraestructura}/

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