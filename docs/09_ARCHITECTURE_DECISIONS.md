# Decisiones de Arquitectura (ADR)

> Decisiones técnicas **respaldadas por el código existente** en commit `50ab065`.

Formato: ID | Decisión | Evidencia en código | Consecuencias

---

## ADR-001 — Monorepo backend + frontend

**Decisión:** Separar API Laravel y SPA React en carpetas `backend/` y `frontend/`.

**Evidencia:** Estructura del repositorio; comunicación vía REST JSON.

**Consecuencias:** Despliegue independiente posible; CORS configurado para `:5173`.

---

## ADR-002 — Laravel 12

**Decisión:** Usar Laravel 12 como framework backend.

**Evidencia:** `composer.json`: `"laravel/framework": "^12.0"`; bootstrap en `bootstrap/app.php` (estilo Laravel 11+).

**Consecuencias:** Routing, middleware y excepciones configurados en `bootstrap/app.php`.

---

## ADR-003 — PostgreSQL como base de datos

**Decisión:** PostgreSQL como motor de BD.

**Evidencia:** `.env.example`: `DB_CONNECTION=pgsql`, `DB_DATABASE=sisganaderia`.

**Consecuencias:** Migraciones compatibles con PostgreSQL; no hay evidencia de MySQL/SQLite en configuración de ejemplo.

---

## ADR-004 — Laravel Sanctum para autenticación API

**Decisión:** Tokens Bearer personales vía Sanctum (no Passport, no JWT custom).

**Evidencia:**
- `composer.json`: `laravel/sanctum ^4.0`
- `User` trait `HasApiTokens`
- Migración `personal_access_tokens`
- Rutas con middleware `auth:sanctum`
- `AuthController::login` → `createToken('api-token')`

**Consecuencias:** Header `Authorization: Bearer {token}`. Expiración actualmente `null`.

---

## ADR-005 — Spatie Laravel Permission para RBAC

**Decisión:** Package Spatie para roles y permisos granulares.

**Evidencia:**
- `composer.json`: `spatie/laravel-permission ^6.25`
- Migración `create_permission_tables`
- `PermissionSeeder`, `RoleSeeder`
- Middleware alias `permission`, `role`, `role_or_permission`

**Consecuencias:** 5 tablas RBAC; convención `{modulo}.{accion}`.

---

## ADR-006 — guard_name = web (no api)

**Decisión:** Permisos y roles usan guard `web`.

**Evidencia:**
- `PermissionSeeder::GUARD = 'web'`
- `config/sanctum.php`: `'guard' => ['web']`
- `config/auth.php`: default guard `web`

**Consecuencias:** Sanctum autentica contra guard web. No usar guard `api` en Spatie.

---

## ADR-007 — Gate::before para super-admin

**Decisión:** Bypass total de policies para rol `super-admin`.

**Evidencia:** `AppServiceProvider::boot()`:
```php
Gate::before(function (User $user, string $ability) {
    return $user->hasRole('super-admin') ? true : null;
});
```

**Consecuencias:** Super-admin no necesita permisos individuales verificados en policies.

---

## ADR-008 — Doble capa de autorización

**Decisión:** Middleware de permiso + Policy + FormRequest authorize.

**Evidencia:** Rutas con `->middleware('permission:...')` y `$this->authorize()` en UserController; `StoreUserRequest::authorize()`.

**Consecuencias:** Defensa en profundidad; más verboso pero más seguro.

---

## ADR-009 — Soft delete + estado separados

**Decisión:** `deleted_at` (SoftDeletes) separado de `estado` boolean.

**Evidencia:**
- Migración `add_soft_deletes_to_users_table`
- `User` trait `SoftDeletes`
- `UserController::destroy` setea `estado = false` antes de delete
- `changeStatus` alterna `estado` sin soft delete

**Consecuencias:** Desactivar ≠ eliminar. Eliminar implica desactivar + soft delete + revocar tokens.

---

## ADR-010 — Registro público deshabilitado (403)

**Decisión:** Mantener ruta register pero responder 403.

**Evidencia:** `AuthController::register()` retorna 403 con mensaje explicativo.

**Consecuencias:** Creación de usuarios solo vía admin con `usuarios.create`. Ruta conservada por compatibilidad.

---

## ADR-011 — UserProtectionService centralizado

**Decisión:** Reglas de protección de usuarios en servicio estático.

**Evidencia:** `UserProtectionService` con `isSelf`, `isLastActiveSuperAdmin`, `wouldRemoveLastSuperAdmin`.

**Consecuencias:** Lógica reutilizable; fácil de testear.

---

## ADR-012 — Revocación de tokens al eliminar/desactivar

**Decisión:** Invalidar sesiones API al eliminar o desactivar usuario.

**Evidencia:** `$user->tokens()->delete()` en `destroy` y `changeStatus` (cuando desactiva).

**Consecuencias:** Usuario desactivado no puede seguir usando token existente.

---

## ADR-013 — React 19 SPA con Vite

**Decisión:** Frontend SPA con React 19, TypeScript, Vite 6.

**Evidencia:** `frontend/package.json`; `main.tsx` con `createRoot`.

**Consecuencias:** Build con `tsc -b && vite build`; HMR en desarrollo.

---

## ADR-014 — TailAdmin como plantilla UI

**Decisión:** Base visual TailAdmin v2.3.0.

**Evidencia:** `package.json` name `tailadmin-react`, version `2.3.0`; componentes layout/sidebar de plantilla.

**Consecuencias:** Demos incluidas; requiere limpieza en fase futura.

---

## ADR-015 — Arquitectura modular frontend

**Decisión:** Módulos de dominio en `src/modules/{dominio}/`.

**Evidencia:** `modules/user/` con pages, components, hooks, services, types, utils.

**Consecuencias:** Patrón replicable para nuevos dominios.

---

## ADR-016 — Auth en localStorage (sin AuthContext)

**Decisión:** Token y user persistidos en localStorage directamente.

**Evidencia:** `utils/auth.ts`, `SignInForm` localStorage.setItem, `ProtectedRoute` lee token.

**Consecuencias:** Sin reactividad global de auth; permisos no persistidos. **Deuda técnica** — pendiente AuthContext.

---

## ADR-017 — API Resources para respuestas

**Decisión:** Transformar entidades con JsonResource.

**Evidencia:** `UserResource`; `UserResource::collection()` en index.

**Consecuencias:** Formato consistente; login aún devuelve User model crudo (inconsistencia menor).

---

## ADR-018 — FormRequest por operación

**Decisión:** Validación en clases FormRequest dedicadas por acción.

**Evidencia:** `StoreUserRequest`, `UpdateUserRequest` en `Http/Requests/Usuario/`.

**Consecuencias:** Controladores delgados; reglas centralizadas.

---

## ADR-019 — Catálogo de permisos anticipado

**Decisión:** Definir permisos de módulos futuros en PermissionSeeder aunque no existan APIs.

**Evidencia:** 43 permisos incluyendo razas, lotes, animales, etc.

**Consecuencias:** Roles pre-configurados para dominio futuro; puede confundir si se interpreta como implementado.

---

## ADR-020 — Infraestructura Laravel en BD

**Decisión:** Cache, sessions y queue con driver `database`.

**Evidencia:** `.env.example`: `CACHE_STORE=database`, `SESSION_DRIVER=database`, `QUEUE_CONNECTION=database`; migraciones correspondientes.

**Consecuencias:** Sin dependencia de Redis en desarrollo; tablas adicionales.

---

## ADR-021 — CORS restrictivo en desarrollo

**Decisión:** Orígenes CORS explícitos para Vite dev server.

**Evidencia:** `config/cors.php`: localhost:5173, 127.0.0.1:5173.

**Consecuencias:** Producción requerirá actualizar allowed_origins.

---

## ADR-022 — TypeScript strict mode

**Decisión:** TypeScript con strict y checks adicionales.

**Evidencia:** `tsconfig.app.json`: `strict: true`, `noUnusedLocals`, `noUnusedParameters`.

**Consecuencias:** Mayor seguridad de tipos; requiere tipado explícito.

---

## Decisiones NO implementadas (mencionadas en diseño previo, ausentes en código)

| Decisión | Estado |
|----------|--------|
| Expiración token 480 min | ❌ `sanctum.expiration = null` |
| AuthContext | ❌ No existe |
| PermissionGate | ❌ No existe |
| Tablas dominio ganadero | ❌ No migradas |
| audit_logs propia | ❌ No existe |
| MySQL como BD | ❌ PostgreSQL en .env.example |
