# Gestión

## Objetivo

Define las tablas encargadas de la supervisión, monitoreo, indicadores, alertas y generación de información estratégica del sistema ganadero.

Este dominio consolida la información generada por el resto de módulos para apoyar la toma de decisiones operativas y gerenciales.

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

---

# indicadores_productivos

## Propósito

Almacena indicadores calculados para cada animal o proceso productivo.

Los indicadores son generados automáticamente a partir de la información registrada en el sistema.

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| animal_id | BIGINT | FK |
| fecha_calculo | DATE | NOT NULL |
| ganancia_peso | NUMERIC(10,2) | NULL |
| edad_meses | INTEGER | NULL |
| dias_gestacion | INTEGER | NULL |
| indice_productivo | NUMERIC(8,2) | NULL |
| metadata | JSONB | NULL |
| created_at | TIMESTAMP | |

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

---

# reportes_generados

## Propósito

Registra el historial de reportes generados por los usuarios.

Permite controlar la generación y descarga de información del sistema.

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

Usuarios
    │
    ▼
Reportes Generados
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