# Reproducción

## Objetivo

Define el ciclo reproductivo del ganado bovino.

Este dominio registra los servicios reproductivos, el seguimiento de las gestaciones y los partos, permitiendo mantener la trazabilidad reproductiva de cada animal.

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

# servicios_reproductivos

## Propósito

Registra cada servicio reproductivo realizado entre un macho reproductor y una hembra.

Es el punto de inicio del proceso reproductivo.

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| hembra_id | BIGINT | FK, NOT NULL |
| macho_id | BIGINT | FK, NULL |
| fecha_servicio | DATE | NOT NULL |
| tipo_servicio | VARCHAR(30) | NOT NULL |
| resultado | VARCHAR(30) | NULL |
| observaciones | TEXT | NULL |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

## Relaciones

BelongsTo → animal (hembra)

BelongsTo → animal (macho)

HasOne → gestacion

## Claves Foráneas

hembra_id → animales.id

macho_id → animales.id

## Índices

- hembra_id
- macho_id
- fecha_servicio

## Reglas

- Solo animales de sexo H pueden registrarse como hembra.
- Solo animales de sexo M pueden registrarse como macho.
- Un servicio puede generar una gestación.
- No eliminar registros históricos.

---

# gestaciones

## Propósito

Realiza el seguimiento de una gestación originada por un servicio reproductivo.

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| servicio_id | BIGINT | FK, NOT NULL |
| fecha_confirmacion | DATE | NULL |
| fecha_probable_parto | DATE | NULL |
| estado | VARCHAR(30) | NOT NULL |
| observaciones | TEXT | NULL |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

## Relaciones

BelongsTo → servicio_reproductivo

HasOne → parto

## Claves Foráneas

servicio_id → servicios_reproductivos.id

## Índices

- servicio_id
- estado

## Reglas

- Una gestación pertenece a un único servicio.
- Solo puede existir una gestación activa por servicio.
- No eliminar historial.

---

# partos

## Propósito

Registra el nacimiento de uno o varios animales derivados de una gestación.

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| gestacion_id | BIGINT | FK, NOT NULL |
| fecha_parto | DATE | NOT NULL |
| cantidad_crias | SMALLINT | DEFAULT 1 |
| observaciones | TEXT | NULL |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

## Relaciones

BelongsTo → gestacion

## Claves Foráneas

gestacion_id → gestaciones.id

## Índices

- gestacion_id
- fecha_parto

## Reglas

- Un parto pertenece a una única gestación.
- Un parto puede generar uno o varios animales.
- Después del parto la gestación finaliza.
- No eliminar registros históricos.

---

# Resumen

| Tabla | SoftDelete | Editable | Histórica |
|--------|------------|----------|-----------|
| servicios_reproductivos | No | Sí | Sí |
| gestaciones | No | Sí | Sí |
| partos | No | Sí | Sí |

---

# Relaciones principales

Animales (Hembra)
        │
        ▼
Servicios Reproductivos
        │
        ▼
Gestaciones
        │
        ▼
Partos
        │
        ▼
Animales (Crías)

---

# Dependencias

Este dominio depende de:

- Núcleo Ganadero
- Catálogos

Y es utilizado por:

- Alertas
- Indicadores Productivos
- Reportes
- Dashboard

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