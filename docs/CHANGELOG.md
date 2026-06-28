# Changelog

Todos los cambios notables del proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

---

## [Unreleased]

_Pendiente de desarrollo. Ver [07_ROADMAP.md](./07_ROADMAP.md)._

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
