# Plantilla Oficial de Módulos

> **Referencia:** Módulo **Razas** (Fase G1) — primer módulo patrón del dominio ganadero.  
> Todo módulo futuro (Lotes, Categorías, Vacunas, Tipos de movimiento, etc.) **debe replicar esta estructura**.

---

## 1. Principios

1. **Backend delgado, Service con lógica** — el Controller solo orquesta y autoriza.
2. **Doble capa RBAC** — middleware `permission:` + Policy + FormRequest `authorize()`.
3. **Respuestas estándar** — paginación `{ data, meta, links }`; acciones `{ message, data? }`.
4. **Soft delete + estado** — `deleted_at` separado de `estado` en catálogos maestros.
5. **Frontend modular** — carpeta `modules/{dominio}/` con estructura fija.
6. **PermissionGate** — ocultar acciones UI según permisos en `localStorage`.
7. **Sin duplicar componentes** — reutilizar `ConfirmDialog`, `Pagination`, `PageBreadCrumb`, `ComponentCard`, etc.

---

## 2. Estructura Backend (normalizada)

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/{Dominio}/
│   │   │   └── {Entidad}Controller.php      # RESTful, delega al Service
│   │   ├── Requests/{Dominio}/
│   │   │   ├── Store{Entidad}Request.php
│   │   │   └── Update{Entidad}Request.php
│   │   └── Resources/{Dominio}/
│   │       └── {Entidad}Resource.php
│   ├── Models/
│   │   └── {Entidad}.php
│   ├── Policies/
│   │   └── {Entidad}Policy.php
│   └── Services/{Dominio}/
│       └── {Entidad}Service.php             # Queries, filtros, reglas de negocio
├── database/
│   ├── migrations/
│   ├── factories/
│   └── seeders/
└── routes/api.php                           # Rutas específicas ANTES de {param}
```

### Ejemplo real — Razas

| Capa | Ruta |
|------|------|
| Controller | `app/Http/Controllers/Api/Razas/RazaController.php` |
| Service | `app/Services/Razas/RazaService.php` |
| Requests | `app/Http/Requests/Razas/StoreRazaRequest.php`, `UpdateRazaRequest.php` |
| Resource | `app/Http/Resources/Razas/RazaResource.php` |
| Policy | `app/Policies/RazaPolicy.php` |
| Model | `app/Models/Raza.php` |

### Registro obligatorio

- Policy en `AppServiceProvider::boot()`: `Gate::policy(Raza::class, RazaPolicy::class)`
- Permisos en `PermissionSeeder` con formato `{modulo}.{accion}`
- Seeder de catálogo en `DatabaseSeeder`

---

## 3. API REST — patrón de rutas

Orden en `routes/api.php` (rutas específicas primero):

```
GET    /{recurso}/eliminados          → deleted()      permission:{modulo}.view
POST   /{recurso}/{id}/restaurar      → restore()      permission:{modulo}.restore
GET    /{recurso}                     → index()        permission:{modulo}.view
POST   /{recurso}                     → store()        permission:{modulo}.create
GET    /{recurso}/{entidad}           → show()         permission:{modulo}.view
PUT    /{recurso}/{entidad}           → update()       permission:{modulo}.update
PATCH  /{recurso}/{entidad}           → update()
DELETE /{recurso}/{entidad}           → destroy()      permission:{modulo}.delete
PATCH  /{recurso}/{entidad}/estado    → changeStatus() permission:{modulo}.activate
```

### Query params estándar (listados)

| Param | Tipo | Descripción |
|-------|------|-------------|
| page | int | Página actual |
| per_page | int | Registros por página (default: 10) |
| search | string | Búsqueda textual |
| estado | boolean | Filtro activo/inactivo |
| sort_by | string | Columna ordenable |
| sort_dir | asc\|desc | Dirección |

### Service — responsabilidades

- `paginate($filters)` — listado activo
- `paginateDeleted($filters)` — soft deleted
- `find($id)`, `create($data)`, `update($model, $data)`
- `delete($model)` — desactiva + soft delete
- `restore($id)`, `toggleStatus($model)`
- `buildQuery($filters)` — search, filtros, ordenamiento (privado)

---

## 4. Estructura Frontend (obligatoria)

```
frontend/src/modules/{dominio}/
├── pages/
│   ├── {Entidad}ListPage.tsx
│   ├── {Entidad}CreatePage.tsx
│   ├── {Entidad}EditPage.tsx
│   ├── {Entidad}DetailPage.tsx
│   └── {Entidad}DeletedPage.tsx
├── components/
│   ├── {Entidad}Table.tsx
│   ├── {Entidad}Form.tsx
│   ├── {Entidad}FiltersBar.tsx    # evitar colisión con tipo {Entidad}Filters
│   ├── {Entidad}Toolbar.tsx
│   ├── {Entidad}StatusBadge.tsx
│   └── index.ts
├── hooks/
│   ├── use{Entidades}.ts          # listado + filtros
│   ├── useCreate{Entidad}.ts
│   ├── useUpdate{Entidad}.ts
│   ├── useDelete{Entidad}.ts      # delete + toggle + restore
│   └── index.ts
├── services/
│   ├── {entidad}Service.ts
│   └── index.ts
├── types/
│   ├── {entidad}.ts
│   ├── filters.ts
│   └── index.ts
├── utils/
│   ├── defaultFilters.ts
│   └── index.ts
├── routes/
│   └── index.tsx                  # export {modulo}Routes fragment
├── permissions/
│   └── index.ts                   # constantes de permisos
├── constants/
│   └── index.ts                   # rutas, page size, sort options
└── index.ts
```

### Integración en App

```tsx
// App.tsx
import { razaRoutes } from "./modules/razas/routes";
// dentro de ProtectedRoute > AppLayout:
{razaRoutes}
```

```tsx
// modules/razas/routes/index.tsx
export const razaRoutes = (
  <>
    <Route path="/razas" element={<RazaListPage />} />
    <Route path="/razas/crear" element={<RazaCreatePage />} />
    ...
  </>
);
```

### PermissionGate

```tsx
import PermissionGate from "@/components/auth/PermissionGate";
import { RAZAS_PERMISSIONS } from "../permissions";

<PermissionGate permission={RAZAS_PERMISSIONS.create}>
  <Link to="/razas/crear">+ Nueva Raza</Link>
</PermissionGate>
```

Requiere que el login persista `permissions` en `localStorage` (implementado en SignInForm).

---

## 5. Checklist para nuevo módulo

### Backend

- [ ] Migración con soft deletes + `estado` (si es catálogo maestro)
- [ ] Model con `$fillable`, `casts()`, scopes útiles
- [ ] Factory + Seeder con datos reales
- [ ] Permisos en `PermissionSeeder` + asignación en `RoleSeeder`
- [ ] FormRequests Store/Update con `authorize()` y validación
- [ ] Policy con métodos: viewAny, view, create, update, delete, restore, activate
- [ ] Service con queries y lógica de negocio
- [ ] Resource JSON
- [ ] Controller RESTful delgado
- [ ] Rutas en `api.php` (orden correcto)
- [ ] `Gate::policy()` registrado

### Frontend

- [ ] Estructura completa `modules/{dominio}/`
- [ ] 5 páginas: list, create, edit, detail, deleted
- [ ] Service API con tipos
- [ ] Hooks separados por operación
- [ ] PermissionGate en acciones
- [ ] ConfirmDialog para delete/toggle/restore
- [ ] Breadcrumbs en `config/breadcrumbs.ts`
- [ ] Rutas en `App.tsx`
- [ ] Enlace en sidebar (opcional, con permiso)

### Documentación

- [ ] `02_DATABASE_SCHEMA.md`
- [ ] `06_MODULES_INDEX.md`
- [ ] `08_PROJECT_STATUS.md`
- [ ] `CHANGELOG.md`

---

## 6. Permisos — catálogo Razas

| Permiso | Uso |
|---------|-----|
| `razas.view` | Listar, detalle, eliminados |
| `razas.create` | Crear |
| `razas.update` | Editar |
| `razas.delete` | Soft delete |
| `razas.restore` | Restaurar |
| `razas.activate` | Activar/desactivar |

---

## 7. Comandos post-implementación

```bash
# Backend
cd backend
php artisan migrate
php artisan db:seed --class=PermissionSeeder   # si hay permisos nuevos
php artisan db:seed --class=RazaSeeder

# Frontend
cd frontend
npm run build
```

---

## 8. Módulos que deben seguir esta plantilla

- Lotes
- Categorías de animales
- Estados productivos
- Vacunas / tipos sanitarios
- Tipos de movimientos
- Tipos de alertas
- Establecimientos / potreros
- Cualquier catálogo CRUD con RBAC

**Excepción:** módulos transaccionales complejos (Animales, Movimientos) extienden la plantilla con relaciones adicionales y validaciones de dominio, pero mantienen la misma estructura de carpetas.
