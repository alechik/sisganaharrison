# Índice de Módulos

> Estado actualizado tras implementación del módulo **Razas** (Fase G1).

**Leyenda de estado:**
- ✅ Implementado
- 🟡 Parcial
- ❌ No implementado
- 📋 Solo permisos/seed (sin código de dominio)

---

## 1. Plataforma

### 1.1 Autenticación (Login / Auth)

| Aspecto | Estado |
|---------|--------|
| **Descripción** | Login, logout, perfil, cambio de contraseña. Registro público bloqueado. |
| **Estado general** | 🟡 Parcial (~75%) |
| **Backend** | ✅ AuthController — login, me, logout, changePassword, register (403) |
| **Frontend** | 🟡 SignInForm, ProtectedRoute, PermissionGate, permisos en localStorage |
| **Base de datos** | ✅ users, personal_access_tokens, sessions |
| **Permisos** | N/A (auth base) |
| **Dependencias** | Sanctum, User model |

**Archivos clave:**
- `backend/app/Http/Controllers/Api/AuthController.php`
- `frontend/src/components/auth/SignInForm.tsx`
- `frontend/src/components/auth/ProtectedRoute.tsx`
- `frontend/src/utils/auth.ts`

---

### 1.2 Usuarios

| Aspecto | Estado |
|---------|--------|
| **Descripción** | CRUD completo de usuarios con roles, soft delete, activar/desactivar |
| **Estado general** | ✅ Implementado (~90%) |
| **Backend** | ✅ UserController, StoreUserRequest, UpdateUserRequest, UserResource, UserPolicy, UserProtectionService |
| **Frontend** | ✅ modules/user/ — UserList, UserCreate, UserEdit, UserDeleted, UserTable, UserForm, useUsers, userService |
| **Base de datos** | ✅ users (soft deletes), model_has_roles |
| **Permisos** | `usuarios.view`, `.create`, `.update`, `.delete`, `.restore`, `.activate` |
| **Dependencias** | Auth, Roles, RBAC |

**Rutas frontend:**
- `/usuarios`
- `/usuarios/crear`
- `/usuarios/:id/editar`
- `/usuarios/eliminados`

---

### 1.3 Roles y Permisos (RBAC)

| Aspecto | Estado |
|---------|--------|
| **Descripción** | Sistema RBAC con Spatie. 45 permisos, 4 roles. |
| **Estado general** | 🟡 Parcial (~70%) |
| **Backend** | ✅ PermissionSeeder, RoleSeeder, middleware, Gate::before, policies |
| **Frontend** | 🟡 PermissionGate implementado; sidebar aún sin filtro global por permisos |
| **Base de datos** | ✅ permissions, roles, model_has_*, role_has_permissions |
| **Permisos** | Catálogo completo en PermissionSeeder |
| **Dependencias** | Auth |

**Endpoint auxiliar:** `GET /api/roles`

---

### 1.4 Layout y Navegación

| Aspecto | Estado |
|---------|--------|
| **Descripción** | Shell de aplicación: sidebar, header, dark mode, breadcrumbs |
| **Estado general** | 🟡 Parcial (~60%) |
| **Backend** | N/A |
| **Frontend** | ✅ AppLayout, AppSidebar, Header, ThemeContext, SidebarContext, PageBreadCrumb |
| **Base de datos** | N/A |
| **Permisos** | ❌ Sidebar no filtra por permisos |
| **Dependencias** | Auth |

**Problema:** Sidebar incluye enlaces a rutas inexistentes (`/animales`, `/lotes`, `/razas`, `/trabajadores`, `/indicadores`) y demos TailAdmin.

---

### 1.5 Dashboard

| Aspecto | Estado |
|---------|--------|
| **Descripción** | Panel principal post-login |
| **Estado general** | 🟡 Demo (~5%) |
| **Backend** | ❌ Sin API de KPIs |
| **Frontend** | 🟡 Home.tsx — plantilla ecommerce TailAdmin con datos ficticios |
| **Base de datos** | ❌ |
| **Permisos** | N/A |
| **Dependencias** | Layout |

---

## 2. Dominio ganadero

### 2.1 Razas — ✅ IMPLEMENTADO (módulo patrón)

| Aspecto | Detalle |
|---------|---------|
| **Descripción** | Catálogo CRUD de razas bovinas — referencia para futuros catálogos |
| **Estado general** | ✅ Implementado (~95%) |
| **Backend** | ✅ RazaController, RazaService, Store/UpdateRazaRequest, RazaResource, RazaPolicy, RazaSeeder |
| **Frontend** | ✅ `modules/razas/` — estructura completa patrón (5 páginas, hooks, PermissionGate) |
| **Base de datos** | ✅ tabla `razas` (soft deletes) |
| **Permisos** | `razas.view`, `.create`, `.update`, `.delete`, `.restore`, `.activate` |
| **Dependencias** | Auth, RBAC |
| **Plantilla** | Ver [11_MODULE_TEMPLATE.md](./11_MODULE_TEMPLATE.md) |

**Rutas frontend:** `/razas`, `/razas/crear`, `/razas/:id`, `/razas/:id/editar`, `/razas/eliminados`

**API:** `GET/POST /api/razas`, `GET/PUT/PATCH/DELETE /api/razas/{raza}`, `PATCH /api/razas/{raza}/estado`, `GET /api/razas/eliminados`, `POST /api/razas/{id}/restaurar`

---

### 2.2 Categorías de Animales — ✅ IMPLEMENTADO

| Aspecto | Detalle |
|---------|---------|
| **Descripción** | Catálogo CRUD de categorías ganaderas (Ternero, Vaca, Toro, etc.) |
| **Estado general** | ✅ Implementado (~95%) |
| **Backend** | ✅ CategoriaAnimalController, CategoriaAnimalService, Requests, Resource, Policy, Seeder |
| **Frontend** | ✅ `modules/categorias-animales/` — réplica patrón Razas |
| **Base de datos** | ✅ tabla `categorias_animales` (campo `activo`, soft deletes) |
| **Permisos** | `categorias_animales.view`, `.create`, `.update`, `.delete`, `.restore`, `.activate` |
| **Dependencias** | Auth, RBAC |

**Rutas frontend:** `/categorias-animales`, `/categorias-animales/crear`, `/categorias-animales/:id`, `/categorias-animales/:id/editar`, `/categorias-animales/eliminados`

**API:** `GET/POST /api/categorias-animales`, `GET/PUT/PATCH/DELETE /api/categorias-animales/{categoria}`, `PATCH .../estado`, `GET .../eliminados`, `POST .../restaurar`

---

### 2.3 Otros módulos — permisos definidos, sin implementación

Los siguientes módulos tienen **permisos en seeders** y/o **enlaces en sidebar**, pero **sin** tablas, modelos, controladores, rutas API y módulos frontend (excepto Razas).

#### Lotes — 📋 ❌

| Permisos seed | `lotes.view`, `.create`, `.update`, `.delete`, `.manage` |
| Sidebar | `/lotes` (404) |

### 2.3 Animales — 📋 ❌

| Permisos seed | `animales.view`, `.create`, `.update`, `.delete`, `.restore`, `.export` |
| Sidebar | `/animales` (404) |

### 2.4 Sanitario — 📋 ❌

| Permisos seed | `sanitario.view`, `.create`, `.update`, `.delete` |

### 2.5 Movimientos — 📋 ❌

| Permisos seed | `movimientos.view`, `.create`, `.update`, `.delete`, `.approve` |

### 2.6 Reproducción — 📋 ❌

| Permisos seed | `reproduccion.view`, `.create`, `.update`, `.delete` |

### 2.7 Indicadores — 📋 ❌

| Permisos seed | `indicadores.view`, `.manage` |
| Sidebar | `/indicadores` (404) |

### 2.8 Alertas — 📋 ❌

| Permisos seed | `alertas.view`, `.manage`, `.resolve` |

### 2.9 Reportes — 📋 ❌

| Permisos seed | `reportes.view`, `.export`, `.manage` |
| Sidebar | Sección "Reportes" (submenu vacío funcional) |

### 2.10 Auditoría — 📋 ❌

| Permisos seed | `auditoria.view` |

### 2.11 Trazabilidad — ❌

Sin permisos seed dedicados. No implementado.

### 2.12 Trabajadores — ❌

Enlace sidebar `/trabajadores` (404). Sin permisos seed ni backend.

---

## 3. Infraestructura / Demo TailAdmin

Páginas demo incluidas en `App.tsx` sin valor de negocio:

| Ruta | Componente | Estado |
|------|------------|--------|
| `/calendar` | Calendar | Demo |
| `/form-elements` | FormElements | Demo |
| `/basic-tables` | BasicTables | Demo |
| `/alerts`, `/avatars`, `/badge`, `/buttons`, `/images`, `/videos` | UI demos | Demo |
| `/line-chart`, `/bar-chart` | Charts | Demo |
| `/blank` | Blank | Demo |
| `/profile` | UserProfiles | Demo (plantilla) |
| `/signin`, `/signup` | Auth pages | SignUp sin backend |

---

## 4. Matriz resumen

| Módulo | Backend | Frontend | BD | Permisos seed | Estado |
|--------|---------|----------|-----|---------------|--------|
| Auth | 🟡 | 🟡 | ✅ | N/A | Parcial |
| Usuarios | ✅ | ✅ | ✅ | ✅ | Implementado |
| RBAC | ✅ | ❌ UI | ✅ | ✅ | Parcial |
| Layout | N/A | 🟡 | N/A | ❌ | Parcial |
| Dashboard | ❌ | 🟡 Demo | ❌ | N/A | Demo |
| Razas | ✅ | ✅ | ✅ | ✅ | Patrón implementado |
| Categorías Animales | ✅ | ✅ | ✅ | ✅ | Implementado (G1.2) |
| Lotes | ❌ | ❌ | ❌ | 📋 | Pendiente |
| Animales | ❌ | ❌ | ❌ | 📋 | Pendiente |
| Sanitario | ❌ | ❌ | ❌ | 📋 | Pendiente |
| Movimientos | ❌ | ❌ | ❌ | 📋 | Pendiente |
| Reproducción | ❌ | ❌ | ❌ | 📋 | Pendiente |
| Indicadores | ❌ | ❌ | ❌ | 📋 | Pendiente |
| Alertas | ❌ | ❌ | ❌ | 📋 | Pendiente |
| Reportes | ❌ | ❌ | ❌ | 📋 | Pendiente |
| Auditoría | ❌ | ❌ | ❌ | 📋 | Pendiente |
| Trazabilidad | ❌ | ❌ | ❌ | ❌ | Pendiente |
| Trabajadores | ❌ | ❌ | ❌ | ❌ | Pendiente |

---

## 5. Dependencias entre módulos (planificadas)

```
Plataforma (Auth + Usuarios + RBAC)
    ↓
Razas ✅ → Categorías Animales ✅
    ↓
Lotes → Animales
    ↓
Sanitario | Movimientos | Reproducción
    ↓
Indicadores + Alertas + Reportes + Auditoría
```

**Razas** es el primer módulo de dominio operativo y sirve de plantilla oficial.
