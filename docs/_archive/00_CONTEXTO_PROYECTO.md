# Contexto del Proyecto — sisganaderia

> **Fuente:** código del commit estable `50ab065` — *Add login, gestion de usuario* (2026-06-25)  
> **Estado de la documentación:** Reconstruida a partir del análisis del repositorio  
> **Última actualización:** 2026-06-28

---

## 1. Descripción del proyecto

**Nombre del repositorio:** `sisganaderia`

**Propósito inferido del código:** Sistema de gestión ganadera con plataforma base (autenticación, RBAC, usuarios) y catálogo de permisos/roles preparado para módulos de dominio: razas, lotes, animales, sanitario, movimientos, reproducción, indicadores, alertas, reportes y auditoría.

**Estado real:** Solo la plataforma base está implementada. No existen tablas, modelos, APIs ni pantallas de dominio ganadero.

---

## 2. Stack tecnológico

| Capa | Tecnología | Versión (según manifiestos) |
|------|------------|----------------------------|
| Backend | PHP | ^8.2 |
| Backend | Laravel | ^12.0 |
| Backend | Laravel Sanctum | ^4.0 |
| Backend | Spatie Laravel Permission | ^6.25 |
| Base de datos | **PostgreSQL** | Configurado en `.env.example` |
| Frontend | React | ^19.0.0 |
| Frontend | TypeScript | ~5.7.2 |
| Frontend | Vite | ^6.1.0 |
| Frontend | Tailwind CSS | ^4.0.8 |
| Frontend | React Router | ^7.1.5 / ^7.16.0 |
| Frontend | Axios | ^1.16.1 |
| Plantilla UI | TailAdmin | 2.3.0 |

**Estructura:** Monorepo con `backend/` (API Laravel) y `frontend/` (SPA React).

---

## 3. Arquitectura general

```
sisganaderia/
├── backend/          # API REST JSON — Laravel 12
│   ├── app/
│   │   ├── Http/Controllers/Api/   # AuthController, UserController
│   │   ├── Http/Requests/Usuario/
│   │   ├── Http/Resources/
│   │   ├── Models/User.php
│   │   ├── Policies/UserPolicy.php
│   │   └── Services/UserProtectionService.php
│   ├── database/migrations/        # 6 migraciones (14 tablas)
│   ├── database/seeders/           # Permission, Role, User
│   └── routes/api.php
│
└── frontend/         # SPA React — Vite
    └── src/
        ├── api/axios.ts
        ├── modules/user/           # Único módulo de negocio implementado
        ├── components/             # UI compartida + auth
        ├── context/                # ThemeContext, SidebarContext
        ├── layout/
        └── pages/                  # Dashboard demo + páginas TailAdmin
```

**Comunicación:** Frontend consume la API en `http://127.0.0.1:8000/api` con token Bearer Sanctum almacenado en `localStorage`.

---

## 4. Estado actual del proyecto

### Implementado

| Área | Detalle |
|------|---------|
| Autenticación API | Login, logout, me, change-password. Registro público deshabilitado (403). |
| RBAC | 43 permisos, 4 roles, middleware `permission:`, `UserPolicy`, `Gate::before` para `super-admin`. |
| Usuarios (backend) | CRUD completo: index paginado, show, store, update, destroy (soft delete), eliminados, restaurar, changeStatus. |
| Usuarios (frontend) | Listado, crear, editar, eliminar, activar/desactivar, pantalla de eliminados en `modules/user/`. |
| Infraestructura UI | Layout, sidebar, dark mode, componentes reutilizables, cliente Axios con interceptor de token (request). |
| Base de datos | 14 tablas: plataforma Laravel + Sanctum + Spatie + soft deletes en `users`. |

### Parcial / pendiente

| Área | Detalle |
|------|---------|
| Auth frontend | Sin `AuthContext`. Auth en `localStorage`. Sin interceptor 401. Sin `PermissionGate`. |
| Permisos en UI | Backend expone permisos en login/me; frontend no los consume. |
| Plantilla demo | Rutas TailAdmin (ecommerce, UI elements, charts) aún presentes. Sidebar mezcla menú de negocio y demo. |
| Dashboard | Plantilla ecommerce con datos ficticios. |
| Token Sanctum | `expiration => null` (sin expiración configurada). |
| Tests | Solo tests de ejemplo de Laravel; sin tests de auth/usuarios/permisos. |
| Usuario demo `administrador` | Rol existe en seeder; no hay usuario demo con ese rol. |

### No implementado

Cero tablas, modelos, controladores, rutas API y módulos frontend para: razas, lotes, animales, sanitario, movimientos, reproducción, indicadores, alertas, reportes, trazabilidad, auditoría.

---

## 5. Cómo comenzar a trabajar

### Requisitos

- PHP 8.2+
- Composer
- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd backend
cp .env.example .env          # Ajustar DB_* para PostgreSQL
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve             # http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

### Usuarios demo (post seed)

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@gmail.com | 12345678 | super-admin |
| vet@gmail.com | 12345678 | veterinario |
| trabajador@gmail.com | 12345678 | trabajador |

---

## 6. Documentación oficial

| Documento | Contenido |
|-----------|-----------|
| [01_ARCHITECTURE.md](./01_ARCHITECTURE.md) | Arquitectura backend/frontend, capas, patrones |
| [02_DATABASE_SCHEMA.md](./02_DATABASE_SCHEMA.md) | Esquema de tablas existentes |
| [03_CODING_STANDARDS.md](./03_CODING_STANDARDS.md) | Convenciones de código |
| [04_PROJECT_RULES.md](./04_PROJECT_RULES.md) | Reglas obligatorias del proyecto |
| [05_API_CONVENTIONS.md](./05_API_CONVENTIONS.md) | Contratos API implementados |
| [06_MODULES_INDEX.md](./06_MODULES_INDEX.md) | Índice de módulos y su estado |
| [07_ROADMAP.md](./07_ROADMAP.md) | Roadmap desde el estado actual |
| [08_PROJECT_STATUS.md](./08_PROJECT_STATUS.md) | Estado detallado, riesgos, pendientes |
| [09_ARCHITECTURE_DECISIONS.md](./09_ARCHITECTURE_DECISIONS.md) | Decisiones técnicas detectadas |
| [10_DEVELOPMENT_WORKFLOW.md](./10_DEVELOPMENT_WORKFLOW.md) | Flujo de trabajo |
| [CHANGELOG.md](./CHANGELOG.md) | Historial de cambios |

---

## 7. Regla principal

**Leer `docs/` antes de escribir código.** Esta carpeta es la única fuente oficial de conocimiento del proyecto.
