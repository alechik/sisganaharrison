# Roadmap

> Construido desde el **estado real** del commit `50ab065`.  
> Las fases marcadas como ⏳ están **pendientes**. Las marcadas ✅ están **implementadas**.

---

## Estado base (punto de partida)

| Completado | Pendiente |
|------------|-----------|
| Auth API (login, logout, me, change-password) | AuthContext frontend |
| RBAC backend (43 permisos, 4 roles) | Permisos en UI |
| CRUD Usuarios backend + frontend | Expiración token Sanctum |
| Soft delete usuarios | Limpieza plantilla TailAdmin |
| PostgreSQL configurado | Tests automatizados |
| Patrón modular frontend (user) | Módulos ganaderos |

**Avance estimado del alcance total:** ~18–22% (plataforma base parcial).

---

## Fase 1 — Consolidación de plataforma ⏳ EN CURSO

### Fase 1.1 — Seguridad y permisos ✅ COMPLETADA

- [x] Spatie Permission instalado y configurado
- [x] 43 permisos en PermissionSeeder
- [x] 4 roles en RoleSeeder
- [x] Middleware `permission:` en rutas
- [x] UserPolicy
- [x] Gate::before para super-admin
- [x] Login/me devuelven roles + permissions

### Fase 1.2 — Consolidación de usuarios ✅ COMPLETADA

- [x] UserController CRUD completo
- [x] Soft delete + restore + changeStatus
- [x] UserProtectionService
- [x] FormRequests + UserResource
- [x] Módulo frontend `modules/user/`
- [x] Listado paginado con filtros

### Fase 1.3 — Robustecimiento de autenticación ⏳ PENDIENTE

**Backend:**
- [ ] Configurar expiración Sanctum (`sanctum.expiration`)

**Frontend:**
- [ ] Crear `context/AuthContext.tsx`
- [ ] Crear `hooks/useAuth.ts`
- [ ] Crear `components/auth/PermissionGate.tsx`
- [ ] Crear `types/auth.ts`
- [ ] Interceptor 401 en `api/axios.ts`
- [ ] Persistir roles/permissions del login
- [ ] Actualizar ProtectedRoute, SignInForm, UserDropdown

**Criterio de cierre:** Token expirado redirige a login; permisos disponibles vía `useAuth().hasPermission()`.

### Fase 1.4 — Preparación dominio ganadero ⏳ PENDIENTE

- [ ] Diseñar e implementar migraciones de tablas ganaderas
- [ ] Modelos Eloquent con relaciones
- [ ] Seeders de catálogo (razas, lotes)
- [ ] Usuario demo con rol `administrador`
- [ ] Validar esquema en PostgreSQL

### Fase 1.5 — Limpieza de plataforma ⏳ PENDIENTE

- [ ] Eliminar rutas/páginas demo TailAdmin no usadas
- [ ] Reescribir AppSidebar con menú de negocio
- [ ] Visibilidad de menú por permiso
- [ ] Placeholder dashboard
- [ ] Remover dependencias npm no usadas
- [ ] Unificar idioma UI (español)

---

## Fase G1 — Primer módulo patrón (Razas) ✅ COMPLETADA

- [x] Backend normalizado: Controller/Requests/Resources/Services/Policies
- [x] Tabla `razas` + Model + Factory + Seeder (10 razas reales)
- [x] API CRUD completa + soft delete + restore + activate
- [x] Frontend `modules/razas/` — estructura patrón obligatoria
- [x] PermissionGate + persistencia de permisos en login
- [x] Documentación `11_MODULE_TEMPLATE.md`

---

## Fase 2 — Catálogos base ⏳ EN CURSO

**Prerequisito:** Fase G1 ✅

| Orden | Módulo | Alcance | Estado |
|-------|--------|---------|--------|
| 2.0 | **Razas** | CRUD backend + frontend | ✅ Completado |
| 2.1 | Lotes | CRUD — replicar plantilla Razas | ⏳ Pendiente |
| 2.2 | Animales | CRUD + identificación básica | ⏳ Pendiente |
| 2.3 | Pesos | Registro básico de peso | ⏳ Pendiente |

Cada módulo debe replicar patrón `modules/user/` con permisos RBAC ya definidos en seeders.

---

## Fase 3 — Operaciones de campo ⏳ PENDIENTE

**Prerequisito:** Fase 2 (Animales operativo).

| Módulo | Alcance |
|--------|---------|
| Sanitario | Eventos sanitarios por animal |
| Movimientos | Traslados entre lotes/ubicaciones |
| Reproducción | Eventos reproductivos |

---

## Fase 4 — Inteligencia y reportes ⏳ PENDIENTE

**Prerequisito:** Fases 2 y 3 con datos operativos.

| Módulo | Alcance |
|--------|---------|
| Indicadores | KPIs y snapshots |
| Alertas | Reglas y notificaciones |
| Reportes | Exportación y reportes gerenciales |
| Dashboard | KPIs reales (reemplazar demo ecommerce) |
| Auditoría | Log de acciones críticas |

---

## Fase 5 — Trazabilidad ⏳ PENDIENTE

**Prerequisito:** Animales + Movimientos operativos.

- Historial de ubicación animal-lote
- Cadena de trazabilidad exportable

---

## Transversal — Calidad ⏳ PENDIENTE

| Tarea | Prioridad |
|-------|-----------|
| Tests Feature: auth, usuarios, permisos | Alta |
| Unificar validación password (min 6 store vs min 8 change-password) | Media |
| Toasts UX (reemplazar alerts) | Baja |
| Locale Laravel a español | Baja |

---

## Orden recomendado inmediato

1. **Fase 2.1 — Lotes** — replicar plantilla de Razas ([11_MODULE_TEMPLATE.md](./11_MODULE_TEMPLATE.md))
2. **Fase 1.3** — AuthContext + interceptor 401 (paralelo recomendado)
3. **Fase 2.2 — Animales** — tras Lotes operativo
