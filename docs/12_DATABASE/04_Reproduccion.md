# Reproducción

## Objetivo

Define el ciclo reproductivo del ganado bovino.

Este dominio registra los servicios reproductivos, el seguimiento de las gestaciones, los partos y los nacimientos individuales, permitiendo mantener la trazabilidad reproductiva de cada animal y soportar el control de natalidad (RF-06, RF-07, RF-12).

La cadena reproductiva oficial del sistema es:

Servicio → Gestación → Parto → Nacimiento → Animal

El parto **no** se relaciona directamente con `animales`. La vinculación con el inventario se establece únicamente a través de `nacimientos.animal_id`.

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

Registra cada servicio reproductivo realizado entre un macho reproductor y una hembra (RF-06).

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

Realiza el seguimiento de una gestación originada por un servicio reproductivo (RF-07).

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

Registra el evento reproductivo de parto asociado a una gestación.

Representa el momento en que la hembra pare, pero **no** registra cada cría ni crea animales directamente. El detalle de cada cría se modela en `nacimientos`.

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| gestacion_id | BIGINT | FK, NOT NULL |
| fecha_parto | DATE | NOT NULL |
| observaciones | TEXT | NULL |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

## Relaciones

BelongsTo → gestacion

HasMany → nacimientos

## Claves Foráneas

gestacion_id → gestaciones.id

## Índices

- gestacion_id
- fecha_parto

## Reglas

- Un parto pertenece a una única gestación.
- Un parto puede generar uno o varios nacimientos.
- La cantidad de crías se obtiene contando los `nacimientos` asociados; no se almacena en esta tabla.
- Después del parto la gestación finaliza.
- No existe relación directa entre `partos` y `animales`.
- No eliminar registros históricos.

---

# nacimientos

## Propósito

Registra cada cría individual derivada de un parto (RF-12).

Separa conceptualmente el **evento de parto** del **nacimiento de cada cría**, permitiendo:

- Partos gemelares o múltiples.
- Crías nacidas vivas con registro posterior en inventario.
- Crías nacidas muertas sin crear `animal`.
- Asignación previa o posterior del arete.
- Control de natalidad y mortalidad al nacer (RF-13).

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| parto_id | BIGINT | FK, NOT NULL |
| animal_id | BIGINT | FK, NULL |
| arete | VARCHAR(30) | NULL |
| sexo | CHAR(1) | CHECK (M,H) |
| peso_nacimiento | NUMERIC(8,2) | NULL |
| estado_nacimiento | VARCHAR(10) | NOT NULL |
| causa_muerte | VARCHAR(150) | NULL |
| observaciones | TEXT | NULL |
| registrado_por | BIGINT | FK, NULL |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

Valores permitidos para `estado_nacimiento`:

- VIVO
- MUERTO

## Relaciones

BelongsTo → parto

BelongsTo → animal

BelongsTo → user (registrado_por)

## Claves Foráneas

parto_id → partos.id

animal_id → animales.id

registrado_por → users.id

## Índices

- parto_id
- animal_id
- arete
- estado_nacimiento
- sexo

## Reglas

- Todo nacimiento pertenece a un único parto.
- Un parto puede tener múltiples nacimientos.
- El `peso_nacimiento` pertenece al nacimiento, no al animal.
- Si la cría nace viva y se registra peso, el sistema puede generar automáticamente el primer registro en `pesajes` al crear el animal (RF-05).
- Si `estado_nacimiento = VIVO`:
  - Puede registrarse inicialmente con `animal_id = NULL`.
  - Puede asignarse `arete` antes o después de crear el animal.
  - Al crear el animal en inventario, debe vincularse mediante `animal_id`.
  - La `fecha_nacimiento` del animal coincide con `partos.fecha_parto`.
  - `madre_id` y `padre_id` del animal se derivan de la gestación/servicio asociado al parto.
  - Si el nacimiento tiene `arete`, se transfiere al animal al momento del alta.
  - El ingreso al inventario ocurre cuando se crea y vincula el animal, no al registrar el parto.
- Si `estado_nacimiento = MUERTO`:
  - **No** se crea `animal`.
  - `animal_id` debe permanecer NULL.
  - `causa_muerte` es obligatoria.
  - Cuenta para estadísticas de mortalidad al nacer, pero no modifica existencias vigentes.
- `registrado_por` identifica al responsable del registro cuando aplique.
- No eliminar registros históricos.

---

# Resumen

| Tabla | SoftDelete | Editable | Histórica |
|--------|------------|----------|-----------|
| servicios_reproductivos | No | Sí | Sí |
| gestaciones | No | Sí | Sí |
| partos | No | Sí | Sí |
| nacimientos | No | Sí | Sí |

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
Nacimientos
        │
        ├────────► Animales (solo VIVO, vinculación posterior o inmediata)
        │
        └────────► Pesajes (primer peso, lógica de negocio)

---

# Cobertura funcional

| RF | Soporte en el modelo |
|----|----------------------|
| RF-06 Eventos reproductivos | `servicios_reproductivos` |
| RF-07 Seguimiento reproductivo | `gestaciones` |
| RF-12 Control de nacimientos | `partos` + `nacimientos` |
| RF-13 Mortalidad al nacer | `nacimientos` con `estado_nacimiento = MUERTO` |

---

# Dependencias

Este dominio depende de:

- Plataforma
- Núcleo Ganadero
- Catálogos

Y es utilizado por:

- Alertas
- Indicadores Productivos
- Reportes
- Dashboard
- Control de existencias

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
