# Arquitectura del Sistema

> Documento reconstruido a partir del código del commit estable `50ab065`.

---

## 1. Visión general

El sistema sigue una arquitectura **cliente-servidor desacoplada**:

- **Backend:** API REST stateless con Laravel 12, autenticación por token Bearer (Sanctum).
- **Frontend:** SPA React 19 que consume la API vía Axios.
- **Autorización:** RBAC con Spatie Permission (`guard_name = web`).

```
┌─────────────────┐     Bearer Token      ┌─────────────────┐
│  React SPA      │ ◄──────────────────► │  Laravel API    │
│  (Vite :5173)   │     JSON / REST       │  (PHP :8000)    │
└─────────────────┘                       └────────┬────────┘
                                                     │
                                            ┌────────▼────────┐
                                            │   PostgreSQL    │
                                            └─────────────────┘
```

---

## 2. Arquitectura Backend

### 2.1 Framework y bootstrap

- Laravel 12 con estructura de bootstrap en `bootstrap/app.php`.
- Rutas API en `routes/api.php` (prefijo `/api` automático).
- Rutas web mínimas en `routes/web.php` (solo vista welcome).
- Health check en `/up`.

### 2.2 Organización por capas

| Capa | Ubicación | Responsabilidad |
|------|-----------|-----------------|
| Rutas | `routes/api.php` | Definición de endpoints y middleware |
| Controladores | `app/Http/Controllers/Api/` | Orquestación HTTP |
| Form Requests | `app/Http/Requests/Usuario/` | Validación + autorización de entrada |
| Resources | `app/Http/Resources/` | Transformación de salida JSON |
| Policies | `app/Policies/` | Autorización a nivel de modelo |
| Services | `app/Services/` | Lógica de negocio transversal |
| Models | `app/Models/` | Eloquent (solo `User` actualmente) |
| Seeders | `database/seeders/` | Datos iniciales RBAC y usuarios |

### 2.3 Controladores existentes

| Controlador | Responsabilidad |
|-------------|-----------------|
| `AuthController` | login, register (403), me, logout, changePassword |
| `UserController` | CRUD usuarios + soft delete, restore, changeStatus |

### 2.4 Patrones backend detectados

**Doble capa de autorización (usuarios):**
1. Middleware `permission:{permiso}` en rutas.
2. `$this->authorize()` en controlador vía `UserPolicy`.
3. `authorize()` en FormRequest.

**Bypass super-admin:**
```php
Gate::before(function (User $user, string $ability) {
    return $user->hasRole('super-admin') ? true : null;
});
```

**Servicio de protección:** `UserProtectionService` centraliza reglas de negocio:
- No auto-eliminarse.
- No auto-desactivarse.
- Proteger último super-admin activo.

**Soft delete + estado:** `deleted_at` (eliminación lógica) separado de `estado` (activo/inactivo). Al eliminar se desactiva, revoca tokens y aplica soft delete.

**API Resources:** Listados paginados usan `UserResource::collection()` con formato estándar Laravel.

---

## 3. Arquitectura Frontend

### 3.1 Stack y build

- Vite 6 + React 19 + TypeScript strict.
- Alias `@/` → `src/` (configurado en `vite.config.ts` y `tsconfig.app.json`).
- Tailwind CSS 4 con PostCSS.
- SVG como componentes React vía `vite-plugin-svgr`.

### 3.2 Organización de carpetas

```
src/
├── api/axios.ts              # Cliente HTTP centralizado
├── modules/{dominio}/        # Módulos de negocio (solo user/)
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   └── utils/
├── components/               # UI compartida (auth, common, form, ui)
├── context/                  # ThemeContext, SidebarContext
├── layout/                   # AppLayout, AppSidebar, Header
├── pages/                    # Páginas sueltas y demos TailAdmin
├── hooks/                    # Hooks globales (useModal, useGoBack)
├── types/                    # Tipos compartidos (api.ts)
├── utils/                    # auth.ts (localStorage)
└── config/                   # breadcrumbs.ts
```

### 3.3 Patrón modular (referencia: `modules/user/`)

Cada módulo de dominio debe seguir:

| Carpeta | Contenido |
|---------|-----------|
| `pages/` | Pantallas enrutadas |
| `components/` | Componentes específicos del módulo |
| `hooks/` | Lógica de estado y fetching |
| `services/` | Llamadas API |
| `types/` | Interfaces TypeScript |
| `utils/` | Helpers del módulo (opcional) |

### 3.4 Routing

- React Router 7 con rutas anidadas bajo `AppLayout`.
- `ProtectedRoute` verifica token en `localStorage`; redirige a `/signin` si ausente.
- Rutas de negocio: `/usuarios`, `/usuarios/crear`, `/usuarios/:id/editar`, `/usuarios/eliminados`.
- Rutas demo TailAdmin aún activas (calendar, charts, form-elements, etc.).

### 3.5 Contextos existentes

| Contexto | Propósito |
|----------|-----------|
| `ThemeContext` | Dark/light mode |
| `SidebarContext` | Estado del sidebar (expandido, mobile) |

**No existe:** `AuthContext`, `PermissionGate`.

---

## 4. Comunicación API

### 4.1 Cliente Axios

```typescript
// frontend/src/api/axios.ts
baseURL: "http://127.0.0.1:8000/api"
headers: { "Content-Type": "application/json", Accept: "application/json" }
```

**Interceptor request:** Añade `Authorization: Bearer {token}` desde `localStorage`.

**Sin interceptor response:** No hay manejo global de 401/403.

### 4.2 CORS

Orígenes permitidos en `backend/config/cors.php`:
- `http://localhost:5173`
- `http://127.0.0.1:5173`

`supports_credentials: true`

### 4.3 Formato de respuestas

- **Listados paginados:** `{ data: [], meta: {}, links: {} }`
- **Acciones:** `{ message: "...", user?: {...} }`
- **Auth login/me:** incluye `user`, `roles`, `permissions`
- **Errores:** `{ message: "..." }` con código HTTP apropiado

---

## 5. Flujo de autenticación

```
┌──────────┐    POST /auth/login     ┌──────────┐
│ SignIn   │ ──────────────────────► │ Laravel  │
│ Form     │ ◄────────────────────── │ Sanctum  │
└──────────┘   token + user + roles   └──────────┘
     │              + permissions
     ▼
localStorage.setItem("token", ...)
localStorage.setItem("user", ...)
     │
     ▼
ProtectedRoute ──► AppLayout ──► Módulos
     │
     │  Cada request API
     ▼
Axios interceptor ──► Authorization: Bearer {token}
     │
     ▼
middleware auth:sanctum ──► Controller
```

### Detalle por endpoint

| Paso | Acción |
|------|--------|
| Login | `Auth::attempt()` → verifica `estado` → crea token Sanctum → devuelve roles y permisos |
| Me | Usuario autenticado + roles + permisos |
| Logout | Elimina token actual (`currentAccessToken()->delete()`) |
| Register | Siempre responde 403 |
| Change password | Valida contraseña actual, mínimo 8 caracteres, confirmed |

### Limitaciones actuales del flujo frontend

1. Login guarda solo `token` y `user`; **no persiste** `roles` ni `permissions`.
2. `ProtectedRoute` solo verifica existencia de token, no validez ni expiración.
3. Sin redirección automática en token inválido (401).

---

## 6. Autorización (RBAC)

### Roles (4)

| Rol | Descripción según permisos asignados |
|-----|--------------------------------------|
| `super-admin` | Todos los permisos (43) + bypass Gate |
| `administrador` | Gestión operativa completa excepto bypass implícito |
| `veterinario` | Operaciones clínicas/campo, sin gestión de usuarios |
| `trabajador` | Consulta y operaciones básicas de campo |

### Convención de permisos

```
{modulo}.{accion}
```

Acciones en catálogo: `view`, `create`, `update`, `delete`, `restore`, `export`, `manage`, `activate`, `approve`, `resolve`.

### Middleware registrado

En `bootstrap/app.php`:
- `permission` → `PermissionMiddleware`
- `role` → `RoleMiddleware`
- `role_or_permission` → `RoleOrPermissionMiddleware`

---

## 7. Infraestructura de soporte

| Componente | Configuración |
|------------|---------------|
| Cache | Driver `database` (tablas `cache`, `cache_locks`) |
| Session | Driver `database` (tabla `sessions`) |
| Queue | Driver `database` (tablas `jobs`, `job_batches`, `failed_jobs`) |
| Mail | Driver `log` |

Estas tablas existen por migraciones Laravel estándar; no hay jobs de negocio implementados.
