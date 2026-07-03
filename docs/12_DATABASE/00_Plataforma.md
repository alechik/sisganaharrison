# Plataforma

## Objetivo

Define las tablas base de autenticación, autorización, seguridad y auditoría del sistema.

Estas tablas soportan Laravel 12, Sanctum y Spatie Permission.

No contienen lógica del dominio ganadero.

---

# Convenciones generales

Motor:
PostgreSQL 17+

PK:
BIGINT Identity

SoftDeletes:
Solo users

Guard:
web

Autenticación:
Laravel Sanctum

Roles:
Spatie Permission

Auditoría:
audit_logs

---

# users

## Propósito

Usuarios del sistema.

Representa todas las personas con acceso a la plataforma.

## Campos

| Campo | Tipo | Restricciones |
|--------|------|---------------|
| id | BIGINT | PK |
| nombre | VARCHAR(100) | NOT NULL |
| apellido | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password | VARCHAR(255) | NOT NULL |
| telefono | VARCHAR(30) | NULL |
| estado | BOOLEAN | DEFAULT TRUE |
| email_verified_at | TIMESTAMP | NULL |
| remember_token | VARCHAR(100) | NULL |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | SoftDeletes |

## Relaciones

roles (Spatie)

tokens (Sanctum)

sessions

audit_logs

## Índices

email UNIQUE

estado

deleted_at

## Reglas

- No eliminar físicamente.
- Solo SoftDelete.
- Email único.
- Password hasheado.

---

# roles

## Propósito

Agrupa permisos.

## Campos

id

name

guard_name

timestamps

## Restricciones

(name, guard_name) UNIQUE

## Relaciones

permissions

users

---

# permissions

## Propósito

Catálogo de permisos.

## Campos

id

name

guard_name

timestamps

## Restricciones

(name, guard_name) UNIQUE

## Relaciones

roles

users

---

# model_has_roles

## Propósito

Asignación de roles.

## Tipo

Tabla Pivot

PK

(role_id, model_id, model_type)

---

# model_has_permissions

## Propósito

Asignación directa de permisos.

## Tipo

Tabla Pivot

PK

(permission_id, model_id, model_type)

---

# role_has_permissions

## Propósito

Relación Roles ↔ Permisos.

## Tipo

Tabla Pivot

PK

(permission_id, role_id)

---

# personal_access_tokens

## Propósito

Tokens API Laravel Sanctum.

## Relaciones

tokenable (Morph)

## Reglas

- Tokens personales.
- No SoftDelete.
- Expiración configurable.

---

# sessions

## Propósito

Sesiones Laravel.

## FK

user_id → users

## Reglas

- Eliminación automática por Laravel.

---

# audit_logs

## Propósito

Registro de auditoría del sistema.

## Campos

id

user_id

tabla

registro_id

accion

valor_anterior JSONB

valor_nuevo JSONB

ip

user_agent

created_at

## Relaciones

user_id → users

## Reglas

Append Only.

Nunca actualizar.

Nunca eliminar.

---

# Resumen

| Tabla | SoftDelete | Editable | Histórica |
|--------|------------|----------|-----------|
| users | Sí | Sí | No |
| roles | No | Sí | No |
| permissions | No | Sí | No |
| model_has_roles | No | Sí | No |
| model_has_permissions | No | Sí | No |
| role_has_permissions | No | Sí | No |
| personal_access_tokens | No | Sí | Sí |
| sessions | No | Sí | Sí |
| audit_logs | No | No | Sí |