# ├ìndice de M├│dulos

> Estado actualizado tras implementaci├│n del m├│dulo **Razas** (Fase G1).

**Leyenda de estado:**
- Ô£à Implementado
- ­ƒƒí Parcial
- ÔØî No implementado
- ­ƒôï Solo permisos/seed (sin c├│digo de dominio)

---

## 1. Plataforma

### 1.1 Autenticaci├│n (Login / Auth)

| Aspecto | Estado |
|---------|--------|
| **Descripci├│n** | Login, logout, perfil, cambio de contrase├▒a. Registro p├║blico bloqueado. |
| **Estado general** | ­ƒƒí Parcial (~75%) |
| **Backend** | Ô£à AuthController ÔÇö login, me, logout, changePassword, register (403) |
| **Frontend** | ­ƒƒí SignInForm, ProtectedRoute, PermissionGate, permisos en localStorage |
| **Base de datos** | Ô£à users, personal_access_tokens, sessions |
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
| **Descripci├│n** | CRUD completo de usuarios con roles, soft delete, activar/desactivar |
| **Estado general** | Ô£à Implementado (~90%) |
| **Backend** | Ô£à UserController, StoreUserRequest, UpdateUserRequest, UserResource, UserPolicy, UserProtectionService |
| **Frontend** | Ô£à modules/user/ ÔÇö UserList, UserCreate, UserEdit, UserDeleted, UserTable, UserForm, useUsers, userService |
| **Base de datos** | Ô£à users (soft deletes), model_has_roles |
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
| **Descripci├│n** | Sistema RBAC con Spatie. 45 permisos, 4 roles. |
| **Estado general** | ­ƒƒí Parcial (~70%) |
| **Backend** | Ô£à PermissionSeeder, RoleSeeder, middleware, Gate::before, policies |
| **Frontend** | ­ƒƒí PermissionGate implementado; sidebar a├║n sin filtro global por permisos |
| **Base de datos** | Ô£à permissions, roles, model_has_*, role_has_permissions |
| **Permisos** | Cat├ílogo completo en PermissionSeeder |
| **Dependencias** | Auth |

**Endpoint auxiliar:** `GET /api/roles`

---

### 1.4 Layout y Navegaci├│n

| Aspecto | Estado |
|---------|--------|
| **Descripci├│n** | Shell de aplicaci├│n: sidebar, header, dark mode, breadcrumbs |
| **Estado general** | ­ƒƒí Parcial (~60%) |
| **Backend** | N/A |
| **Frontend** | Ô£à AppLayout, AppSidebar, Header, ThemeContext, SidebarContext, PageBreadCrumb |
| **Base de datos** | N/A |
| **Permisos** | ÔØî Sidebar no filtra por permisos |
| **Dependencias** | Auth |

**Problema:** Sidebar incluye enlaces a rutas inexistentes (`/animales`, `/lotes`, `/razas`, `/trabajadores`, `/indicadores`) y demos TailAdmin.

---

### 1.5 Dashboard

| Aspecto | Estado |
|---------|--------|
| **Descripci├│n** | Panel principal post-login |
| **Estado general** | ­ƒƒí Demo (~5%) |
| **Backend** | ÔØî Sin API de KPIs |
| **Frontend** | ­ƒƒí Home.tsx ÔÇö plantilla ecommerce TailAdmin con datos ficticios |
| **Base de datos** | ÔØî |
| **Permisos** | N/A |
| **Dependencias** | Layout |

---

## 2. Dominio ganadero

### 2.1 Razas ÔÇö Ô£à IMPLEMENTADO (m├│dulo patr├│n)

| Aspecto | Detalle |
|---------|---------|
| **Descripci├│n** | Cat├ílogo CRUD de razas bovinas ÔÇö referencia para futuros cat├ílogos |
| **Estado general** | Ô£à Implementado (~95%) |
| **Backend** | Ô£à RazaController, RazaService, Store/UpdateRazaRequest, RazaResource, RazaPolicy, RazaSeeder |
| **Frontend** | Ô£à `modules/razas/` ÔÇö estructura completa patr├│n (5 p├íginas, hooks, PermissionGate) |
| **Base de datos** | Ô£à tabla `razas` (soft deletes) |
| **Permisos** | `razas.view`, `.create`, `.update`, `.delete`, `.restore`, `.activate` |
| **Dependencias** | Auth, RBAC |
| **Plantilla** | Ver [11_MODULE_TEMPLATE.md](./11_MODULE_TEMPLATE.md) |

**Rutas frontend:** `/razas`, `/razas/crear`, `/razas/:id`, `/razas/:id/editar`, `/razas/eliminados`

**API:** `GET/POST /api/razas`, `GET/PUT/PATCH/DELETE /api/razas/{raza}`, `PATCH /api/razas/{raza}/estado`, `GET /api/razas/eliminados`, `POST /api/razas/{id}/restaurar`

---

### 2.2 Categor├¡as de Animales ÔÇö Ô£à IMPLEMENTADO

| Aspecto | Detalle |
|---------|---------|
| **Descripci├│n** | Cat├ílogo CRUD de categor├¡as ganaderas (Ternero, Vaca, Toro, etc.) |
| **Estado general** | Ô£à Implementado (~95%) |
| **Backend** | Ô£à CategoriaAnimalController, CategoriaAnimalService, Requests, Resource, Policy, Seeder |
| **Frontend** | Ô£à `modules/categorias-animales/` ÔÇö r├®plica patr├│n Razas |
| **Base de datos** | Ô£à tabla `categorias_animales` (campo `activo`, soft deletes) |
| **Permisos** | `categorias_animales.view`, `.create`, `.update`, `.delete`, `.restore`, `.activate` |
| **Dependencias** | Auth, RBAC |

**Rutas frontend:** `/categorias-animales`, `/categorias-animales/crear`, `/categorias-animales/:id`, `/categorias-animales/:id/editar`, `/categorias-animales/eliminados`

**API:** `GET/POST /api/categorias-animales`, `GET/PUT/PATCH/DELETE /api/categorias-animales/{categoria}`, `PATCH .../estado`, `GET .../eliminados`, `POST .../restaurar`

---

### 2.3 Otros m├│dulos ÔÇö permisos definidos, sin implementaci├│n

Los siguientes m├│dulos tienen **permisos en seeders** y/o **enlaces en sidebar**, pero **sin** tablas, modelos, controladores, rutas API y m├│dulos frontend (excepto Razas).

#### Lotes ÔÇö ­ƒôï ÔØî

| Permisos seed | `lotes.view`, `.create`, `.update`, `.delete`, `.manage` |
| Sidebar | `/lotes` (404) |

### 2.3 Animales ÔÇö ­ƒôï ÔØî

| Permisos seed | `animales.view`, `.create`, `.update`, `.delete`, `.restore`, `.export` |
| Sidebar | `/animales` (404) |

### 2.4 Sanitario ÔÇö ­ƒôï ÔØî

| Permisos seed | `sanitario.view`, `.create`, `.update`, `.delete` |

### 2.5 Movimientos ÔÇö ­ƒôï ÔØî

| Permisos seed | `movimientos.view`, `.create`, `.update`, `.delete`, `.approve` |

### 2.6 Reproducci├│n ÔÇö ­ƒôï ÔØî

| Permisos seed | `reproduccion.view`, `.create`, `.update`, `.delete` |

### 2.7 Indicadores ÔÇö ­ƒôï ÔØî

| Permisos seed | `indicadores.view`, `.manage` |
| Sidebar | `/indicadores` (404) |

### 2.8 Alertas ÔÇö ­ƒôï ÔØî

| Permisos seed | `alertas.view`, `.manage`, `.resolve` |

### 2.9 Reportes ÔÇö ­ƒôï ÔØî

| Permisos seed | `reportes.view`, `.export`, `.manage` |
| Sidebar | Secci├│n "Reportes" (submenu vac├¡o funcional) |

### 2.10 Auditor├¡a ÔÇö ­ƒôï ÔØî

| Permisos seed | `auditoria.view` |

### 2.11 Trazabilidad ÔÇö ÔØî

Sin permisos seed dedicados. No implementado.

### 2.12 Trabajadores ÔÇö ÔØî

Enlace sidebar `/trabajadores` (404). Sin permisos seed ni backend.

---

## 3. Infraestructura / Demo TailAdmin

P├íginas demo incluidas en `App.tsx` sin valor de negocio:

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

| M├│dulo | Backend | Frontend | BD | Permisos seed | Estado |
|--------|---------|----------|-----|---------------|--------|
| Auth | ­ƒƒí | ­ƒƒí | Ô£à | N/A | Parcial |
| Usuarios | Ô£à | Ô£à | Ô£à | Ô£à | Implementado |
| RBAC | Ô£à | ÔØî UI | Ô£à | Ô£à | Parcial |
| Layout | N/A | ­ƒƒí | N/A | ÔØî | Parcial |
| Dashboard | ÔØî | ­ƒƒí Demo | ÔØî | N/A | Demo |
| Razas | Ô£à | Ô£à | Ô£à | Ô£à | Patr├│n implementado |
| Categor├¡as Animales | Ô£à | Ô£à | Ô£à | Ô£à | Implementado (G1.2) |
| Lotes | ÔØî | ÔØî | ÔØî | ­ƒôï | Pendiente |
| Animales | ÔØî | ÔØî | ÔØî | ­ƒôï | Pendiente |
| Sanitario | ÔØî | ÔØî | ÔØî | ­ƒôï | Pendiente |
| Movimientos | ÔØî | ÔØî | ÔØî | ­ƒôï | Pendiente |
| Reproducci├│n | ÔØî | ÔØî | ÔØî | ­ƒôï | Pendiente |
| Indicadores | ÔØî | ÔØî | ÔØî | ­ƒôï | Pendiente |
| Alertas | ÔØî | ÔØî | ÔØî | ­ƒôï | Pendiente |
| Reportes | ÔØî | ÔØî | ÔØî | ­ƒôï | Pendiente |
| Auditor├¡a | ÔØî | ÔØî | ÔØî | ­ƒôï | Pendiente |
| Trazabilidad | ÔØî | ÔØî | ÔØî | ÔØî | Pendiente |
| Trabajadores | ÔØî | ÔØî | ÔØî | ÔØî | Pendiente |

---

## 5. Dependencias entre m├│dulos (planificadas)

```
Plataforma (Auth + Usuarios + RBAC)
    Ôåô
Razas Ô£à ÔåÆ Categor├¡as Animales Ô£à
    Ôåô
Lotes ÔåÆ Animales
    Ôåô
Sanitario | Movimientos | Reproducci├│n
    Ôåô
Indicadores + Alertas + Reportes + Auditor├¡a
```

**Razas** es el primer m├│dulo de dominio operativo y sirve de plantilla oficial.
