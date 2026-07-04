# Changelog

Todos los cambios notables del proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

---

## [Unreleased]

_Pendiente: módulo Lotes (Fase 2.1)._

---

## [2026-07-03] — Fase G1.5: Tipos de Eventos Sanitarios

### Added

**Backend:**
- Migración `tipos_eventos_sanitarios` (patrón común: codigo, nombre, descripcion, activo, soft deletes)
- Model `TipoEventoSanitario`, Factory, `TipoEventoSanitarioSeeder` (6 tipos de la spec)
- `TipoEventoSanitarioService`, Policy, Requests, Resource, Controller
- 9 endpoints REST en `/api/tipos-eventos-sanitarios`
- Permisos `tipos_eventos_sanitarios.*` — CRUD en `administrador`; `view` en `veterinario` y `trabajador`

**Frontend:**
- Módulo `modules/tipos-eventos-sanitarios/` (patrón idéntico a Razas)
- Rutas integradas en App + sidebar + breadcrumbs

**Documentación:** Actualizados `06`, `08`

---

## [2026-07-03] — Fase G1.4: Estados Productivos

### Added

**Backend:**
- Migración `estados_productivos` (patrón común: codigo, nombre, descripcion, activo, soft deletes)
- Model `EstadoProductivo`, Factory, `EstadoProductivoSeeder` (8 estados ganaderos)
- `EstadoProductivoService`, Policy, Requests, Resource, Controller
- 9 endpoints REST en `/api/estados-productivos`
- Permisos `estados_productivos.*` (6 permisos) — CRUD en `administrador`; `view` en `veterinario` y `trabajador`

**Frontend:**
- Módulo `modules/estados-productivos/` (patrón idéntico a Razas)
- Rutas integradas en App + sidebar + breadcrumbs

**Documentación:** Actualizados `06`, `08`

---

## [2026-06-28] — Fase G1.3: Vacunas

### Added

**Backend:**
- Migración `vacunas` (codigo, nombre, laboratorio, descripcion, activo, soft deletes)
- Model `Vacuna`, Factory, `VacunaSeeder` (10 vacunas ganaderas)
- `VacunaService`, Policy, Requests, Resource, Controller
- 9 endpoints REST en `/api/vacunas`
- Permisos `vacunas.*` (6 permisos) — asignados a `administrador` y `super-admin`; `vacunas.view` a `veterinario` y `trabajador`

**Frontend:**
- Módulo `modules/vacunas/` (patrón idéntico a Razas/Categorías)
- Rutas integradas en App + sidebar + breadcrumbs

**Documentación:** Actualizados `06`, `08`

---

## [2026-06-28] — Reorganización permanente de conocimiento

### Changed

- **Arquitectura de conocimiento:** convenciones permanentes → `.cursor/rules/` (4 reglas)
- **`docs/00_PROJECT_CONTEXT.md`** — contexto operativo mínimo (reemplaza `00_CONTEXTO_PROYECTO.md`)
- **`docs/02_DATABASE_SCHEMA.md`** — solo índice hacia `12_DATABASE/`
- **`docs/11_MODULE_TEMPLATE.md`** — checklist y flujo (sin duplicar rules)
- **`docs/06_MODULES_INDEX.md`**, **`docs/08_PROJECT_STATUS.md`** — versiones resumidas
- **`docs/README.md`** — guía de lectura para Agent

### Archived

- Documentos históricos movidos a `docs/_archive/` (arquitectura, standards, API detallada, roadmap, workflow)

---

## [2026-06-28] — Fase G1.2: Categorías de Animales

### Added

**Backend:**
- Migración `categorias_animales` (codigo, nombre, descripcion, activo, soft deletes)
- Model `CategoriaAnimal`, Factory, `CategoriaAnimalSeeder` (9 categorías reales)
- `CategoriaAnimalService`, Policy, Requests, Resource, Controller
- 9 endpoints REST en `/api/categorias-animales`
- Permisos `categorias_animales.*` (6 permisos) — asignados a `administrador` y `super-admin`

**Frontend:**
- Módulo `modules/categorias-animales/` (patrón idéntico a Razas)
- Rutas integradas en App + sidebar + breadcrumbs

**Documentación:** Actualizados `02`, `06`, `07`, `08`

### Notes

- Campo de estado: `activo` (vs `estado` en Razas) según especificación del módulo.
- Ejecutar `php artisan migrate` y seeders de permisos/categorías.

---

## [2026-06-28] — Fase G1: Módulo patrón Razas

### Added

**Backend:**
- Migración `razas` (nombre, codigo, descripcion, estado, soft deletes)
- Model `Raza`, Factory, `RazaSeeder` (10 razas reales)
- `RazaService`, `RazaPolicy`, `StoreRazaRequest`, `UpdateRazaRequest`, `RazaResource`
- `RazaController` en `Api/Razas/` — 9 endpoints REST
- Permisos `razas.restore`, `razas.activate` en PermissionSeeder

**Frontend:**
- Módulo completo `modules/razas/` (estructura patrón oficial)
- `PermissionGate` + `utils/permissions.ts`
- Persistencia de permisos en login (SignInForm)
- Rutas: `/razas`, `/razas/crear`, `/razas/:id`, `/razas/:id/editar`, `/razas/eliminados`

**Documentación:**
- `docs/11_MODULE_TEMPLATE.md` — plantilla obligatoria para módulos futuros
- Actualizados: `02`, `06`, `07`, `08`

### Notes

- Ejecutar `php artisan migrate` y `php artisan db:seed` para aplicar cambios.
- Re-login necesario para cargar permisos en localStorage.

---

## [2026-06-28] — Documentación reconstruida

### Added

- Reconstrucción completa de la carpeta `docs/` a partir del análisis del código del commit estable `50ab065`.
- Documentos creados:
  - `00_CONTEXTO_PROYECTO.md`
  - `01_ARCHITECTURE.md`
  - `02_DATABASE_SCHEMA.md`
  - `03_CODING_STANDARDS.md`
  - `04_PROJECT_RULES.md`
  - `05_API_CONVENTIONS.md`
  - `06_MODULES_INDEX.md`
  - `07_ROADMAP.md`
  - `08_PROJECT_STATUS.md`
  - `09_ARCHITECTURE_DECISIONS.md`
  - `10_DEVELOPMENT_WORKFLOW.md`
  - `CHANGELOG.md`

### Notes

- La documentación anterior se había perdido por corrupción de archivos.
- Fuente de verdad para la reconstrucción: código en `backend/`, `frontend/` y archivos de configuración.
- No se documentaron funcionalidades inexistentes.
- Corrección respecto a documentación previa: base de datos oficial es **PostgreSQL** (según `.env.example`), no MySQL.

---

## [2026-06-25] — Commit estable de referencia

### Added (código — commit `50ab065`)

**Mensaje:** Add login, gestion de usuario

**Backend:**
- Autenticación API: login, logout, me, change-password, register (403)
- RBAC: 43 permisos, 4 roles (Spatie Permission)
- CRUD usuarios completo con soft delete, restore, changeStatus
- UserPolicy, UserProtectionService
- FormRequests: StoreUserRequest, UpdateUserRequest
- UserResource
- Seeders: Permission, Role, User
- Migraciones: users, sanctum tokens, spatie permissions, soft deletes, cache, jobs

**Frontend:**
- Módulo `modules/user/`: listado, crear, editar, eliminados
- SignIn, ProtectedRoute, UserDropdown
- Cliente Axios con interceptor de token
- Layout TailAdmin con sidebar, dark mode
- Rutas demo TailAdmin

**Infraestructura:**
- Monorepo Laravel 12 + React 19
- PostgreSQL configurado en `.env.example`
- CORS para Vite dev server

---

## [Histórico anterior]

Commits anteriores a `50ab065` no analizados en esta reconstrucción.  
El commit `50ab065` representa el último estado estable conocido del repositorio al momento de la auditoría documental.
