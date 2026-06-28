# Estado del Proyecto

> Snapshot al **2026-06-28**, reconstruido desde commit `50ab065`.

**Estado global:** DOCUMENTACIÓN CONSOLIDADA — Plataforma base parcial operativa.

**Avance estimado:** ~18–22% del alcance funcional total.

---

## 1. Qué existe

### Backend

| Componente | Detalle |
|------------|---------|
| Framework | Laravel 12, PHP 8.2+ |
| Auth | Sanctum 4 — token Bearer |
| RBAC | Spatie Permission 6 — 43 permisos, 4 roles |
| Modelos | `User` (único modelo de aplicación) |
| Controladores | `AuthController`, `UserController` |
| Policies | `UserPolicy` |
| Services | `UserProtectionService` |
| Form Requests | `StoreUserRequest`, `UpdateUserRequest` |
| Resources | `UserResource` |
| Migraciones | 6 archivos → 14 tablas |
| Seeders | Permission, Role, User |
| Rutas API | 14 endpoints (auth + usuarios + roles) |
| Tests | Solo ExampleTest (smoke) |

### Frontend

| Componente | Detalle |
|------------|---------|
| Framework | React 19, TypeScript 5.7, Vite 6 |
| Estilos | Tailwind CSS 4 |
| Routing | React Router 7 |
| HTTP | Axios con interceptor de token (request) |
| Módulos negocio | `modules/user/` (completo) |
| Contextos | ThemeContext, SidebarContext |
| Layout | AppLayout, AppSidebar, Header |
| Auth UI | SignIn, ProtectedRoute, UserDropdown |
| Demo | ~15 rutas TailAdmin |

### Base de datos

- PostgreSQL configurado en `.env.example`
- 14 tablas migradas
- 3 usuarios demo en seeder
- Soft deletes en `users`

---

## 2. Qué funciona

Verificado por implementación en código:

| Funcionalidad | Backend | Frontend |
|---------------|---------|----------|
| Login con email/password | ✅ | ✅ |
| Logout | ✅ | ✅ |
| Obtener perfil (me) | ✅ | ❌ No consumido post-login |
| Cambio de contraseña | ✅ | ❌ Sin UI |
| Registro público bloqueado | ✅ (403) | 🟡 SignUp existe pero inútil |
| Listar usuarios paginado | ✅ | ✅ |
| Crear usuario | ✅ | ✅ |
| Editar usuario | ✅ | ✅ |
| Eliminar usuario (soft) | ✅ | ✅ |
| Restaurar usuario | ✅ | ✅ |
| Activar/desactivar usuario | ✅ | ✅ |
| Filtrar por search/estado | ✅ | 🟡 Parcial en UI |
| Asignar roles | ✅ | ✅ (selector single role) |
| RBAC middleware | ✅ | N/A |
| Protección super-admin | ✅ | N/A |
| Protección auto-eliminación | ✅ | 🟡 UI parcial (currentUserId) |
| Dark mode | N/A | ✅ |
| Sidebar navegación | N/A | 🟡 Mix negocio + demo |

---

## 3. Qué falta

### Plataforma (prioridad alta)

- [ ] AuthContext y useAuth
- [ ] PermissionGate en UI
- [ ] Interceptor 401 en Axios
- [ ] Expiración de tokens Sanctum
- [ ] UI cambio de contraseña
- [ ] Tests Feature auth/usuarios/permisos
- [ ] Limpieza rutas demo TailAdmin
- [ ] Sidebar filtrado por permisos
- [ ] Dashboard con datos reales
- [ ] Usuario demo rol `administrador`
- [ ] Unificar idioma (es/en)
- [ ] Unificar validación password (min 6 vs min 8)

### Dominio ganadero (prioridad post-plataforma)

- [ ] Tablas: razas, lotes, animales, sanitario, movimientos, reproducción, indicadores, alertas, reportes, auditoría
- [ ] Modelos Eloquent de dominio
- [ ] Controladores, requests, resources, policies por módulo
- [ ] Módulos frontend por dominio
- [ ] APIs de negocio
- [ ] Trazabilidad

---

## 4. Riesgos

| # | Riesgo | Impacto | Mitigación |
|---|--------|---------|------------|
| R1 | Sin interceptor 401 — token inválido no redirige | Medio | Fase 1.3 |
| R2 | Permisos no consumidos en frontend — UI no refleja RBAC | Alto | PermissionGate en Fase 1.3 |
| R3 | Tokens Sanctum sin expiración | Medio | Configurar sanctum.expiration |
| R4 | Sidebar con rutas 404 (/animales, /lotes, etc.) | Bajo | Fase 1.5 o deshabilitar enlaces |
| R5 | Sin tests automatizados | Alto | Tests Feature antes de Fase 2 |
| R6 | SignUp.tsx activo pero register = 403 | Bajo | Ocultar o eliminar en Fase 1.5 |
| R7 | Login no guarda permissions en localStorage | Alto | AuthContext Fase 1.3 |
| R8 | Password min:6 en store vs min:8 en change-password | Bajo | Unificar reglas |
| R9 | GET /roles sin Resource wrapper — inconsistencia API | Bajo | Estandarizar cuando se refactorice |
| R10 | Dependencias npm demo sin uso (@fullcalendar, etc.) | Bajo | Limpiar en Fase 1.5 |
| R11 | APP_LOCALE=en vs UI parcialmente en español | Bajo | Config + revisión strings |

---

## 5. Dependencias pendientes

### Entorno de desarrollo

```bash
# Backend — requerido antes de probar
cd backend
composer install
cp .env.example .env   # Configurar PostgreSQL
php artisan key:generate
php artisan migrate
php artisan db:seed

# Frontend
cd frontend
npm install
npm run dev
```

### Paquetes instalados sin uso activo de negocio

**Backend dev:** pint, pail, sail, phpunit (solo example tests)

**Frontend:** @fullcalendar/*, @react-jvectormap/*, apexcharts, react-dnd, swiper, flatpickr (usados por demos TailAdmin)

---

## 6. Commit de referencia

```
50ab065d8845df2bfd409f801305047e9ba86f69
Add login, gestion de usuario
2026-06-25 16:48:13 -0400
```

Este commit es la fuente confiable del código analizado para reconstruir esta documentación.

---

## 7. Próximo paso recomendado

**Fase 1.3 — Robustecimiento de autenticación**

Motivo: el backend ya expone `permissions` en login/me, pero el frontend no los consume. Sin AuthContext e interceptor 401, el desarrollo seguro de módulos posteriores queda incompleto.

Esperar nueva instrucción antes de comenzar implementación.
