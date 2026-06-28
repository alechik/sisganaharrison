# Estándares de Codificación

> Convenciones detectadas en el código existente del commit `50ab065`.

---

## 1. Backend (Laravel / PHP)

### 1.1 Estructura de archivos

| Tipo | Ubicación | Convención de nombre |
|------|-----------|---------------------|
| Controladores API | `app/Http/Controllers/Api/` | `{Entidad}Controller.php` |
| Form Requests | `app/Http/Requests/{Dominio}/` | `{Accion}{Entidad}Request.php` |
| Resources | `app/Http/Resources/` | `{Entidad}Resource.php` |
| Policies | `app/Policies/` | `{Entidad}Policy.php` |
| Services | `app/Services/` | `{Dominio}Service.php` |
| Models | `app/Models/` | Singular PascalCase |
| Seeders | `database/seeders/` | `{Entidad}Seeder.php` |

### 1.2 Namespaces

- PSR-4: `App\` → `app/`
- Requests agrupados por dominio en español: `App\Http\Requests\Usuario\`

### 1.3 Controladores

- Namespace: `App\Http\Controllers\Api`
- Extienden `Controller` base.
- Métodos REST estándar: `index`, `show`, `store`, `update`, `destroy`.
- Acciones adicionales descriptivas: `deleted`, `restore`, `changeStatus`.
- Type hints en parámetros y retorno (`JsonResponse`, `AnonymousResourceCollection`).
- Autorización explícita: `$this->authorize('action', Model::class)` al inicio de cada método.

### 1.4 Form Requests

- `authorize()` verifica permiso Spatie: `$this->user()?->can('usuarios.create')`.
- Reglas de validación en `rules()` con strings de reglas Laravel.
- Mensajes en español implícitos (respuestas del controlador en español).

**Ejemplo de reglas usuarios (store):**
```php
'nombre' => 'required|string|max:100',
'apellido' => 'required|string|max:100',
'email' => 'required|email|unique:users,email',
'telefono' => 'nullable|string|max:20',
'password' => 'required|min:6',
'roles' => 'required|array'
```

### 1.5 API Resources

- Extienden `JsonResource`.
- Método `toArray(Request $request): array`.
- Relaciones anidadas transformadas manualmente (ej: roles con `id` y `name`).

### 1.6 Models

- `$fillable` explícito (no `$guarded`).
- `casts()` como método protegido (Laravel 11+ style).
- Traits: `HasApiTokens`, `HasRoles`, `SoftDeletes`, `HasFactory`.
- Accessors como métodos `get{Nombre}Attribute()`.
- `$appends` para atributos calculados.

### 1.7 Services

- Clase con métodos `public static`.
- Sin inyección de dependencias (estado actual).
- Nombre descriptivo de reglas de negocio.

### 1.8 Rutas API

- Agrupadas por prefijo y comentarios de sección.
- Middleware `auth:sanctum` para rutas privadas.
- Middleware `permission:{nombre}` por endpoint.
- Rutas específicas (`eliminados`, `restaurar`) **antes** de rutas con parámetro `{user}`.
- Nombres de rutas en español: `/usuarios`, `/estado`, `/restaurar`.

### 1.8 Seeders

- Constantes de clase para datos estáticos (`PermissionSeeder::PERMISSIONS`, `PermissionSeeder::GUARD`).
- `firstOrCreate` para idempotencia.
- `DatabaseSeeder` llama en orden: Permission → Role → User.

### 1.9 Idioma

- Mensajes de respuesta API en **español**.
- Config Laravel (`APP_LOCALE=en`) en inglés — inconsistencia conocida.
- Campos de BD en **español**: `nombre`, `apellido`, `telefono`, `estado`.

### 1.10 Permisos RBAC

- Formato: `{modulo}.{accion}` en minúsculas.
- `guard_name = 'web'` (constante en `PermissionSeeder::GUARD`).

---

## 2. Frontend (React / TypeScript)

### 2.1 Estructura modular

```
modules/{dominio}/
├── pages/          # Componentes de página (PascalCase, export default)
├── components/     # Componentes del módulo
├── hooks/          # Custom hooks (use{Nombre})
├── services/       # Funciones async API ({entidad}Service.ts)
├── types/          # Interfaces TypeScript
└── utils/          # Helpers opcionales
```

### 2.2 TypeScript

- `strict: true` en `tsconfig.app.json`.
- `noUnusedLocals`, `noUnusedParameters` activos.
- Interfaces para entidades: `User`, `UserCreateRequest`, `UserUpdateRequest`.
- Tipos compartidos en `src/types/api.ts`: `PaginatedResponse<T>`, `PaginationMeta`.

### 2.3 Imports

- Alias `@/` para rutas absolutas desde `src/`.
- Imports relativos permitidos dentro del mismo módulo/carpeta cercana.

### 2.4 Componentes

- Functional components con hooks.
- Props tipadas con `interface Props` o inline.
- Export default para páginas; named exports para hooks/services/types.
- JSX con Tailwind utility classes.
- Soporte dark mode: clases `dark:` de Tailwind.

### 2.5 Servicios API

- Un archivo por módulo: `{dominio}Service.ts`.
- Funciones async que retornan tipos explícitos.
- Mapeo de respuesta paginada Laravel a tipo frontend (`mapPaginated`).
- Parámetros query con defaults: `page ?? 1`, `per_page ?? 10`.

### 2.6 Hooks

- Prefijo `use`: `useUsers`.
- Estado local con `useState`, efectos con `useEffect`, memoización con `useCallback`.
- Retorno como objeto con propiedades nombradas.

### 2.7 Routing

- React Router 7 (`react-router` y `react-router-dom`).
- Rutas protegidas envueltas en `<ProtectedRoute>`.
- Parámetros dinámicos: `/usuarios/:id/editar`.

### 2.8 Autenticación frontend

- Token y user en `localStorage`.
- Utilidades en `utils/auth.ts`: `saveAuth`, `getUser`, `getToken`, `logout`, `isAuthenticated`.
- Login directo en `SignInForm` (no usa `saveAuth` helper).

### 2.9 UI / Tailwind

- Plantilla TailAdmin v2.3.0 como base visual.
- Componentes UI reutilizables en `components/ui/`, `components/form/`, `components/common/`.
- Clases semánticas de plantilla: `menu-item`, `text-theme-sm`, `text-brand-500`.
- Iconos SVG importados como componentes React desde `icons/`.

### 2.10 Breadcrumbs

- Configuración centralizada en `config/breadcrumbs.ts`.
- Uso de `PageBreadCrumb` en páginas de módulo.

### 2.11 Idioma UI

- Mezcla español/inglés: módulo usuarios en español; plantilla demo y login en inglés.
- Mensajes de error de acciones en español.

---

## 3. Nomenclatura general

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Tablas BD | plural snake_case | `users`, `personal_access_tokens` |
| Campos BD | snake_case español | `nombre`, `apellido`, `estado` |
| Permisos | `{modulo}.{accion}` | `usuarios.view` |
| Roles | kebab-case | `super-admin` |
| Rutas API | español, plural | `/api/usuarios/{id}/estado` |
| Rutas frontend | español | `/usuarios/crear` |
| Archivos TSX | PascalCase | `UserList.tsx` |
| Archivos TS servicios | camelCase | `userService.ts` |
| Hooks | camelCase con `use` | `useUsers.ts` |

---

## 4. Formato de respuestas API (convención establecida)

**Paginación:**
```json
{
  "data": [],
  "meta": { "current_page", "last_page", "per_page", "total", "from", "to" },
  "links": { "first", "last", "prev", "next" }
}
```

**Acción exitosa:**
```json
{ "message": "...", "user": { ... } }
```

**Error:**
```json
{ "message": "..." }
```

Códigos HTTP usados: 200, 201, 400, 401, 403, 404.
