# Esquema de Base de Datos

> Documenta **únicamente** las tablas existentes en las migraciones del commit `50ab065`.  
> Motor configurado: **PostgreSQL** (`DB_CONNECTION=pgsql` en `.env.example`).

**Total de tablas:** 16  
**Migraciones:** 8 archivos en `backend/database/migrations/`

---

## Diagrama de relaciones (tablas existentes)

```
users ──────────────┬──► model_has_roles ──► roles ──► role_has_permissions ──► permissions
                    │
                    └──► model_has_permissions ──► permissions

users ──► personal_access_tokens (morph tokenable)
users ──► sessions (user_id FK)

[Infraestructura Laravel]
cache, cache_locks, jobs, job_batches, failed_jobs, password_reset_tokens
```

---

## 1. users

**Propósito:** Usuarios del sistema. Entidad central de autenticación y RBAC.

**Migraciones:** `0001_01_01_000000_create_users_table.php`, `2026_06_10_000001_add_soft_deletes_to_users_table.php`

| Campo | Tipo | Notas |
|-------|------|-------|
| id | bigint PK | Auto-increment |
| email | string | UNIQUE |
| email_verified_at | timestamp | Nullable |
| password | string | Hasheado |
| nombre | string | |
| apellido | string | |
| telefono | string | Nullable |
| estado | boolean | Default `true`. Activo/inactivo |
| remember_token | string | Nullable |
| created_at, updated_at | timestamps | |
| deleted_at | timestamp | **SoftDeletes** |

**Relaciones:**
- `HasRoles` (Spatie) → `model_has_roles`
- `HasApiTokens` (Sanctum) → `personal_access_tokens`
- Sesiones → `sessions.user_id`

**Índices importantes:**
- UNIQUE en `email`

**Modelo:** `App\Models\User` — traits: `HasApiTokens`, `HasFactory`, `Notifiable`, `HasRoles`, `SoftDeletes`

**Atributo calculado:** `nombre_completo` (append)

---

## 2. password_reset_tokens

**Propósito:** Tokens de recuperación de contraseña (Laravel estándar).

| Campo | Tipo | Notas |
|-------|------|-------|
| email | string PK | |
| token | string | |
| created_at | timestamp | Nullable |

**SoftDeletes:** No  
**Uso actual:** Tabla creada; no hay flujo de reset implementado en API.

---

## 3. sessions

**Propósito:** Almacenamiento de sesiones (driver `database`).

| Campo | Tipo | Notas |
|-------|------|-------|
| id | string PK | |
| user_id | bigint FK | Nullable, indexed |
| ip_address | string(45) | Nullable |
| user_agent | text | Nullable |
| payload | longText | |
| last_activity | integer | Indexed |

**SoftDeletes:** No

---

## 4. personal_access_tokens

**Propósito:** Tokens API de Laravel Sanctum.

**Migración:** `2026_05_18_175201_create_personal_access_tokens_table.php`

| Campo | Tipo | Notas |
|-------|------|-------|
| id | bigint PK | |
| tokenable_type, tokenable_id | morphs | Referencia a `users` |
| name | text | Ej: `api-token` |
| token | string(64) | UNIQUE (hash) |
| abilities | text | Nullable |
| last_used_at | timestamp | Nullable |
| expires_at | timestamp | Nullable, indexed |
| created_at, updated_at | timestamps | |

**SoftDeletes:** No  
**Nota:** `sanctum.expiration` está en `null`; tokens no expiran por configuración.

---

## 5. permissions

**Propósito:** Catálogo de permisos RBAC (Spatie).

**Migración:** `2026_05_18_175547_create_permission_tables.php`

| Campo | Tipo | Notas |
|-------|------|-------|
| id | bigint PK | |
| name | string | Ej: `usuarios.view` |
| guard_name | string | Valor: `web` |
| created_at, updated_at | timestamps | |

**Índices:** UNIQUE (`name`, `guard_name`)

**Datos seed:** 43 permisos definidos en `PermissionSeeder` (incluye permisos para módulos futuros).

---

## 6. roles

**Propósito:** Roles RBAC (Spatie).

| Campo | Tipo | Notas |
|-------|------|-------|
| id | bigint PK | |
| name | string | Ej: `super-admin` |
| guard_name | string | Valor: `web` |
| created_at, updated_at | timestamps | |

**Índices:** UNIQUE (`name`, `guard_name`)

**Datos seed:** 4 roles — `super-admin`, `administrador`, `veterinario`, `trabajador`

---

## 7. model_has_permissions

**Propósito:** Permisos asignados directamente a modelos (pivot polimórfico).

| Campo | Tipo | Notas |
|-------|------|-------|
| permission_id | bigint FK | → permissions |
| model_type | string | Ej: `App\Models\User` |
| model_id | bigint | |

**PK compuesta:** (`permission_id`, `model_id`, `model_type`)

---

## 8. model_has_roles

**Propósito:** Roles asignados a modelos (pivot polimórfico).

| Campo | Tipo | Notas |
|-------|------|-------|
| role_id | bigint FK | → roles |
| model_type | string | |
| model_id | bigint | |

**PK compuesta:** (`role_id`, `model_id`, `model_type`)

---

## 9. role_has_permissions

**Propósito:** Permisos asignados a roles (pivot).

| Campo | Tipo | Notas |
|-------|------|-------|
| permission_id | bigint FK | → permissions |
| role_id | bigint FK | → roles |

**PK compuesta:** (`permission_id`, `role_id`)

---

## 10. cache

**Propósito:** Cache en base de datos (driver `database`).

| Campo | Tipo |
|-------|------|
| key | string PK |
| value | mediumText |
| expiration | integer (indexed) |

---

## 11. cache_locks

**Propósito:** Locks de cache.

| Campo | Tipo |
|-------|------|
| key | string PK |
| owner | string |
| expiration | integer (indexed) |

---

## 12. jobs

**Propósito:** Cola de trabajos (driver `database`).

| Campo | Tipo |
|-------|------|
| id | bigint PK |
| queue | string (indexed) |
| payload | longText |
| attempts | tinyint |
| reserved_at | unsigned int |
| available_at | unsigned int |
| created_at | unsigned int |

---

## 13. job_batches

**Propósito:** Lotes de jobs.

| Campo | Tipo |
|-------|------|
| id | string PK |
| name | string |
| total_jobs, pending_jobs, failed_jobs | integer |
| failed_job_ids | longText |
| options | mediumText |
| cancelled_at, created_at, finished_at | integer |

---

## 14. failed_jobs

**Propósito:** Registro de jobs fallidos.

| Campo | Tipo |
|-------|------|
| id | bigint PK |
| uuid | string UNIQUE |
| connection, queue | text |
| payload, exception | longText |
| failed_at | timestamp |

---

---

## 15. razas

**Propósito:** Catálogo de razas bovinas. Primer módulo de dominio ganadero (patrón para catálogos).

**Migración:** `2026_06_28_000001_create_razas_table.php`

| Campo | Tipo | Notas |
|-------|------|-------|
| id | bigint PK | Auto-increment |
| nombre | string(100) | Indexed |
| codigo | string(20) | UNIQUE — identificador corto (ej: `BRAHMAN`) |
| descripcion | text | Nullable |
| estado | boolean | Default `true`. Activo/inactivo |
| created_at, updated_at | timestamps | |
| deleted_at | timestamp | **SoftDeletes** |

**Relaciones:** Ninguna aún (futuro: `animales.raza_id`).

**Índices importantes:**
- UNIQUE en `codigo`
- INDEX en `estado`, `nombre`

**Modelo:** `App\Models\Raza` — traits: `HasFactory`, `SoftDeletes`  
**Scope:** `activos()` — filtra `estado = true`

**Datos seed:** 10 razas reales en `RazaSeeder` (Brahman, Nelore, Angus, etc.)

---

## 16. categorias_animales

**Propósito:** Catálogo de categorías ganaderas (Ternero, Vaca, Toro, etc.).

**Migración:** `2026_06_28_000002_create_categorias_animales_table.php`

| Campo | Tipo | Notas |
|-------|------|-------|
| id | bigint PK | Auto-increment |
| codigo | string(20) | UNIQUE |
| nombre | string(100) | Indexed |
| descripcion | text | Nullable |
| activo | boolean | Default `true` |
| created_at, updated_at | timestamps | |
| deleted_at | timestamp | **SoftDeletes** |

**Relaciones:** Ninguna aún (futuro: `animales.categoria_id`).

**Índices importantes:**
- UNIQUE en `codigo`
- INDEX en `activo`, `nombre`

**Modelo:** `App\Models\CategoriaAnimal` — `$table = 'categorias_animales'`  
**Scope:** `activos()` — filtra `activo = true`

**Datos seed:** 9 categorías reales en `CategoriaAnimalSeeder`

---

## Resumen

| Tabla | SoftDeletes | Dominio |
|-------|-------------|---------|
| users | Sí | Plataforma |
| password_reset_tokens | No | Infraestructura |
| sessions | No | Infraestructura |
| personal_access_tokens | No | Auth (Sanctum) |
| permissions | No | RBAC |
| roles | No | RBAC |
| model_has_permissions | No | RBAC |
| model_has_roles | No | RBAC |
| role_has_permissions | No | RBAC |
| cache, cache_locks | No | Infraestructura |
| jobs, job_batches, failed_jobs | No | Infraestructura |
| razas | Sí | Dominio ganadero (catálogo) |
| **categorias_animales** | **Sí** | **Dominio ganadero (catálogo)** |

**Pendientes:** lotes, animales y demás tablas de dominio.
