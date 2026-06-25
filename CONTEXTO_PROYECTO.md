# CONTEXTO DEL PROYECTO — Sistema Ganadero Harrison

> Documento de continuidad generado a partir de la auditoría técnica y el diseño de Fase 1.  
> **Última actualización:** 14 de junio de 2026  
> **Estado de implementación:** Fase 1.1 y 1.2 completadas · Fase 1.3 pendiente

---

## 1. Descripción del proyecto

**Nombre:** Sistema Inteligente de Gestión y Trazabilidad para Ganado Vacuno con Soporte a la Toma de Decisiones para **Agropecuaria Harrison**.

**Objetivo:** Digitalizar y centralizar la gestión ganadera con módulos de animales, salud, movimientos, reproducción, indicadores, alertas, reportes y trazabilidad.

**Cliente / contexto:** Operación agropecuaria vacuna (Paraguay/Argentina — razas y catálogos orientados a la región).

---

## 2. Stack tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Backend** | Laravel 12, PHP 8.2+, Sanctum 4, Spatie Permission 6, MySQL (objetivo) |
| **Frontend** | React 19, TypeScript 5.7, Vite 6, Tailwind CSS 4, React Router 7 |
| **Plantilla UI** | TailAdmin v2.3.0 (en proceso de depuración) |
| **Estructura** | Monorepo: `backend/` + `frontend/` |

---

## 3. Estado actual del proyecto

### Avance global estimado: **~18–22%** del alcance funcional total

*(Sube respecto al 8–12% inicial tras completar plataforma base parcial)*

### Completado

| Área | Detalle |
|------|---------|
| **Autenticación básica** | Login, logout, me, change-password. Token Bearer Sanctum. Registro público bloqueado (403). |
| **RBAC (Fase 1.1)** | 43 permisos granulares, 4 roles, middleware `permission:`, `UserPolicy`, `Gate::before` para `super-admin`. Login/me devuelven `roles` + `permissions`. |
| **Usuarios (Fase 1.2)** | CRUD completo backend: index (paginado, filtros), show, store, update, destroy (soft delete), eliminados, restaurar, changeStatus. Protecciones vía `UserProtectionService`. |
| **Usuarios frontend** | Listado con paginación, crear, editar, eliminar, activar/desactivar, pantalla eliminados. Patrón modular en `modules/user/`. |
| **Infraestructura** | Layout, sidebar, dark mode, componentes UI reutilizables, cliente axios con interceptor de token. |
| **Base de datos (plataforma)** | 14 tablas Laravel/Sanctum/Spatie + `deleted_at` en users. |

### Parcial / pendiente de consolidar

| Área | Detalle |
|------|---------|
| **Auth frontend** | Sin `AuthContext`; auth dispersa en `localStorage`. Sin interceptor 401. Sin `PermissionGate`. |
| **Permisos en UI** | Backend devuelve permisos pero frontend no los consume para ocultar acciones. |
| **Plantilla demo** | ~70% de rutas TailAdmin aún presentes (ecommerce, UI elements, charts). Sidebar mezcla negocio + demo. |
| **Dashboard** | Plantilla ecommerce con datos ficticios. |
| **Seeders en BD** | Código listo; requiere `composer install` + `migrate` + `db:seed` en entorno local. |
| **MySQL** | `.env.example` puede seguir apuntando a SQLite; alinear a MySQL. |
| **Tokens Sanctum** | Expiración aún no configurada (480 min planificado en diseño). |

### No iniciado (dominio ganadero)

Cero tablas, modelos, APIs y pantallas de: razas, lotes, animales, sanitario, movimientos, reproducción, indicadores, alertas, reportes, trazabilidad, auditoría.

---

## 4. Estructura del repositorio

```
sisganaderia/
├── backend/                    # Laravel 12 API
│   ├── app/
│   │   ├── Http/Controllers/Api/   # AuthController, UserController
│   │   ├── Http/Requests/Usuario/
│   │   ├── Http/Resources/
│   │   ├── Models/User.php
│   │   ├── Policies/UserPolicy.php
│   │   └── Services/UserProtectionService.php
│   ├── database/
│   │   ├── migrations/         # users, sanctum, spatie, soft_deletes
│   │   └── seeders/            # Permission, Role, User, Database
│   └── routes/api.php
│
├── frontend/                   # React 19 SPA
│   └── src/
│       ├── api/axios.ts
│       ├── modules/user/       # Patrón estándar por dominio
│       ├── components/         # UI + auth + common
│       ├── context/            # ThemeContext, SidebarContext (sin AuthContext)
│       ├── layout/
│       └── pages/              # Dashboard + demos TailAdmin
│
└── CONTEXTO_PROYECTO.md        # Este documento
```

### Patrón frontend por módulo (replicar en Fase 2+)

```
modules/{dominio}/
├── pages/
├── components/
├── hooks/
├── services/
├── types/
└── utils/          # opcional
```

---

## 5. Roles y permisos (RBAC)

### Roles

| Rol | Uso |
|-----|-----|
| `super-admin` | Acceso total (bypass `Gate::before`) |
| `administrador` | Gestión operativa completa excepto bypass implícito |
| `veterinario` | Operaciones clínicas y campo (sin usuarios ni auditoría) |
| `trabajador` | Consulta y operaciones básicas de campo |

### Convención de permisos

```
{modulo}.{accion}
```

Acciones: `view`, `create`, `update`, `delete`, `restore`, `export`, `manage`, `activate`, `approve`, `resolve`.

### Decisión técnica importante

| Diseño original | Implementación real | Motivo |
|-----------------|---------------------|--------|
| `guard_name = api` | **`guard_name = web`** | Roles existentes ya usaban `web`; Sanctum opera sobre guard `web`. No cambiar sin migración de datos. |

### Usuarios demo (seeders)

| Email | Rol |
|-------|-----|
| `admin@gmail.com` | super-admin |
| `vet@gmail.com` | veterinario |
| `trabajador@gmail.com` | trabajador |

> Falta usuario demo con rol `administrador` (opcional, recomendado en Fase 1.3 o 1.4).

---

## 6. API — Endpoints implementados

### Auth (`/api/auth`)

| Método | Ruta | Estado |
|--------|------|--------|
| POST | `/login` | ✅ |
| POST | `/register` | ✅ Responde **403** (deshabilitado) |
| GET | `/me` | ✅ Incluye roles + permissions |
| POST | `/logout` | ✅ |
| POST | `/change-password` | ✅ |

### Usuarios (`/api/usuarios`) — requiere auth + permisos

| Método | Ruta | Permiso |
|--------|------|---------|
| GET | `/usuarios` | `usuarios.view` |
| POST | `/usuarios` | `usuarios.create` |
| GET | `/usuarios/{id}` | `usuarios.view` |
| PUT/PATCH | `/usuarios/{id}` | `usuarios.update` |
| DELETE | `/usuarios/{id}` | `usuarios.delete` |
| PATCH | `/usuarios/{id}/estado` | `usuarios.activate` |
| GET | `/usuarios/eliminados` | `usuarios.view` |
| POST | `/usuarios/{id}/restaurar` | `usuarios.restore` |

### Otros

| Método | Ruta | Permiso |
|--------|------|---------|
| GET | `/roles` | `usuarios.view` |

### Contrato de paginación (estándar)

```json
{
  "data": [...],
  "meta": { "current_page", "last_page", "per_page", "total" },
  "links": { "next", "prev" }
}
```

Query params usuarios: `?page=&per_page=&search=&estado=`

---

## 7. Decisiones arquitectónicas

| ID | Decisión | Justificación |
|----|----------|---------------|
| D1 | RBAC Spatie con permisos `{modulo}.{accion}` | Flexibilidad; package ya instalado |
| D2 | `guard_name = web` (no `api`) | Compatibilidad Sanctum + roles existentes |
| D3 | Soft delete en usuarios y entidades maestras futuras | Recuperación y auditoría |
| D4 | `estado` (activo/inactivo) separado de `deleted_at` | Desactivar ≠ eliminar |
| D5 | Doble capa seguridad usuarios: middleware + Policy | Defensa en profundidad |
| D6 | `Gate::before` para super-admin | Bypass sin duplicar 43 permisos en lógica |
| D7 | Registro público → 403 (ruta conservada) | No rompe clientes; creación solo vía admin |
| D8 | `UserProtectionService` centralizado | Reglas: no auto-eliminar, no auto-desactivar, proteger último super-admin |
| D9 | Revocar tokens al eliminar/desactivar | Seguridad de sesiones |
| D10 | AuthContext planificado (sin Redux) | Complejidad acorde al tamaño actual |
| D11 | Permisos en memoria vía `/auth/me`, no en localStorage | Evitar desincronización |
| D12 | Token Sanctum 480 min (8h) — **pendiente implementar** | Jornada laboral |
| D13 | Patrón `modules/{dominio}/` en frontend | Escalable para 9+ módulos |
| D14 | `animal_lote` como historial de ubicación | Trazabilidad (Fase 1.4+) |
| D15 | `peso_actual` denormalizado en animales | Performance listados (Fase 1.4+) |
| D16 | `indicadores_snapshot` materializado | Reportes históricos (Fase 4+) |
| D17 | `audit_logs` propia (no activitylog package) | Control total (Fase 1.4+) |
| D18 | Migraciones completas en 1.4, CRUD dominio en Fase 2+ | Esquema estable antes de APIs |
| D19 | MySQL como BD oficial | Requisito producción |

---

## 8. Modelo de datos ganadero (diseñado, no migrado)

Orden de creación planificado:

1. `razas` → 2. `lotes` → 3. `animales` → 4. `animal_lote` → 5. `pesos`  
6. `eventos_sanitarios` → 7. `movimientos` → 8. `eventos_reproductivos`  
9. `reglas_alerta` → 10. `alertas` → 11. `indicadores_snapshot` → 12. `audit_logs`

Entidad central: **`animales`** (código caravana/DTE único, FK raza, madre/padre auto-referencia, soft delete).

Ver diagrama ERD completo en el transcript de diseño (`cursor_auditor_a_t_cnica_del_sistema_ga.md`, Bloque 1D).

---

## 9. Roadmap — Fase 1 (consolidación plataforma)

```
FASE 1.1 ✅ Seguridad y Permisos (backend)
    ↓
FASE 1.2 ✅ Consolidación de Usuarios (backend + frontend)
    ↓
FASE 1.3 ⏳ Robustecimiento de Autenticación  ← SIGUIENTE
    ↓
FASE 1.4 ⏳ Modelo de Datos Ganadero (migraciones + modelos + seeders catálogo)
    ↓
FASE 1.5 ⏳ Limpieza de Plataforma (frontend)
```

### Fase 1.3 — Pendiente (detalle)

**Backend:**
- Configurar expiración Sanctum (480 min)

**Frontend (crear):**
- `context/AuthContext.tsx`
- `hooks/useAuth.ts`
- `components/auth/PermissionGate.tsx`
- `types/auth.ts`

**Frontend (modificar):**
- `main.tsx`, `axios.ts` (interceptor 401), `ProtectedRoute.tsx`, `SignInForm.tsx`, `UserDropdown.tsx`, `utils/auth.ts`

**Criterio de cierre:** token expirado redirige a login; permisos disponibles vía `useAuth().hasPermission()`.

### Fase 1.4 — Pendiente (detalle)

- 12 migraciones de dominio + modelos Eloquent + relaciones
- `RazaSeeder`, `LoteSeeder`
- Trait `Auditable` + tabla `audit_logs`
- Alinear `UserFactory`
- Validar en MySQL

### Fase 1.5 — Pendiente (detalle)

- Eliminar rutas/páginas demo TailAdmin
- Reescribir `AppSidebar` con menú de negocio
- Visibilidad por permiso; badge "Próximamente" en módulos futuros
- Placeholder dashboard ganadero
- Branding Agropecuaria Harrison
- Remover deps npm no usadas (`@fullcalendar/*`, etc.)

---

## 10. Fase 2 y posteriores (post Fase 1)

| Fase | Alcance |
|------|---------|
| **Fase 2** | CRUD Razas → Lotes → Animales (+ pesos básicos) |
| **Fase 3** | Sanitario, Movimientos, Reproducción |
| **Fase 4** | Indicadores, Alertas, Reportes, Dashboard ejecutivo con KPIs reales |
| **Transversal** | Trazabilidad (via `animal_lote`, movimientos, identificación) |

### Mapa de dependencias entre módulos

```
Plataforma Base (F1) → Razas + Lotes → Animales
Animales → Sanitario | Movimientos | Reproducción | Trazabilidad
Sanitario + Reproducción + Movimientos → Alertas
Animales + Indicadores → Dashboard + Reportes
```

---

## 11. Tareas pendientes inmediatas

### Operativas (entorno dev)

```bash
cd backend
composer install
php artisan migrate
php artisan db:seed
# o: php artisan migrate:fresh --seed
```

### Desarrollo — prioridad

| # | Tarea | Fase |
|---|-------|------|
| 1 | Implementar AuthContext + interceptor 401 | 1.3 |
| 2 | PermissionGate en botones y sidebar | 1.3 |
| 3 | Expiración token Sanctum 480 min | 1.3 |
| 4 | Migraciones modelo ganadero (12 tablas) | 1.4 |
| 5 | Limpiar demos TailAdmin | 1.5 |
| 6 | Migrar `.env.example` a MySQL | 1.1/1.4 |
| 7 | Usuario demo `administrador` | 1.3/1.4 |
| 8 | Tests Feature auth + usuarios + permisos | Calidad |
| 9 | Toasts UX (reemplazar alerts inline) | Mejora |

### Deuda técnica conocida

- Rutas demo generan 404 o confusión (`/animales`, `/lotes`, etc.)
- `SignUp.tsx` existe pero registro backend está deshabilitado
- Sin tests automatizados de API
- Validación password inconsistente (min 6 store vs min 8 register) — unificar
- Locale inglés en config Laravel vs app en español

---

## 12. Módulos — matriz de estado

| Módulo | Backend | Frontend | BD | Avance |
|--------|---------|----------|-----|--------|
| Login / Auth | Parcial | Parcial | ✅ | ~75% |
| Usuarios | ✅ | ✅ | ✅ | ~90% |
| Roles y Permisos | ✅ | ❌ UI | ✅ | ~60% |
| Layout / Nav | N/A | Parcial | N/A | ~60% |
| Dashboard | ❌ | Demo | ❌ | ~5% |
| Razas | ❌ | ❌ | ❌ | 0% |
| Lotes | ❌ | ❌ | ❌ | 0% |
| Animales | ❌ | ❌ | ❌ | 0% |
| Sanitario | ❌ | ❌ | ❌ | 0% |
| Movimientos | ❌ | ❌ | ❌ | 0% |
| Reproducción | ❌ | ❌ | ❌ | 0% |
| Indicadores | ❌ | ❌ | ❌ | 0% |
| Alertas | ❌ | Demo UI | ❌ | 0% |
| Reportes | ❌ | ❌ | ❌ | 0% |
| Trazabilidad | ❌ | ❌ | ❌ | 0% |
| Auditoría | ❌ | ❌ | ❌ | 0% |

---

## 13. Comandos útiles

```bash
# Backend
cd backend
composer install
php artisan serve                    # http://localhost:8000
php artisan migrate:fresh --seed

# Frontend
cd frontend
npm install
npm run dev                          # http://localhost:5173
```

### Pruebas manuales clave (post seed)

1. Login `admin@gmail.com` → permissions con 43 items
2. `GET /api/usuarios` como super-admin → 200 paginado
3. `GET /api/usuarios` como trabajador → 403
4. CRUD usuarios en UI: crear → editar → desactivar → eliminar → restaurar
5. Auto-protección: no eliminar/desactivar propio usuario

---

## 14. Archivos clave de referencia

| Propósito | Ruta |
|-----------|------|
| Permisos | `backend/database/seeders/PermissionSeeder.php` |
| Roles | `backend/database/seeders/RoleSeeder.php` |
| Policy usuarios | `backend/app/Policies/UserPolicy.php` |
| Protecciones | `backend/app/Services/UserProtectionService.php` |
| Rutas API | `backend/routes/api.php` |
| Bypass super-admin | `backend/app/Providers/AppServiceProvider.php` |
| Módulo user (patrón) | `frontend/src/modules/user/` |
| Paginación tipos | `frontend/src/types/api.ts` |
| Transcript completo | `cursor_auditor_a_t_cnica_del_sistema_ga.md` |

---

## 15. Reglas para continuar el desarrollo

1. **No crear proyecto nuevo** — extender el monorepo existente.
2. **Seguir el orden de fases** — no saltar a módulos ganaderos sin cerrar Fase 1.
3. **Replicar patrón `modules/user/`** en cada dominio nuevo.
4. **Aplicar permisos** en API (middleware + policy) y UI (`PermissionGate`) desde el inicio de cada módulo.
5. **Usar contrato paginado estándar** en todos los listados.
6. **No asumir guard `api`** — usar `web` en Spatie.
7. **Ejecutar seeders** tras cambios en permisos/roles.
8. **Validar en MySQL**, no solo SQLite.

---

## 16. Próximo paso recomendado

**Implementar Fase 1.3 — Robustecimiento de Autenticación**

Motivo: el backend ya expone `permissions` en login/me, pero el frontend no los consume. Sin AuthContext e interceptor 401, la Fase 1.5 (sidebar por permisos) y el desarrollo seguro de Fase 2 quedan bloqueados o incompletos.

Duración estimada restante de Fase 1 completa: **7–10 días** (1.3 + 1.4 + 1.5).

---

*Documento generado para continuidad de desarrollo. Consultar `cursor_auditor_a_t_cnica_del_sistema_ga.md` para auditoría original, diseño detallado ERD, matriz completa de permisos y listado de archivos por subfase.*
