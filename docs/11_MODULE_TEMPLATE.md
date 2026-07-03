# Plantilla de Módulos

> **Referencia de código:** módulo **Razas** (`frontend/src/modules/razas/` + backend `Razas/`).  
> Convenciones Laravel/React/API/RBAC: `.cursor/rules/` — **no repetidas aquí**.

---

## Orden de implementación

1. Spec tabla → `docs/12_DATABASE/{Dominio}.md`
2. Migración + Factory + Seeder
3. Model + Policy + permisos (`PermissionSeeder`, `RoleSeeder`)
4. FormRequests + Service + Resource + Controller
5. Rutas `api.php` + `Gate::policy()` + `Route::bind()` si aplica
6. Frontend completo `modules/{modulo}/`
7. Integración: `App.tsx`, breadcrumbs, sidebar
8. Verificar: `php artisan route:list`, `npm run build`
9. Actualizar docs operativos (abajo)

---

## Checklist — archivos backend

- [ ] `database/migrations/*_create_{tabla}_table.php`
- [ ] `app/Models/{Entidad}.php`
- [ ] `database/factories/{Entidad}Factory.php`
- [ ] `database/seeders/{Entidad}Seeder.php` + registro en `DatabaseSeeder`
- [ ] `app/Services/{Modulo}/{Entidad}Service.php`
- [ ] `app/Http/Controllers/Api/{Modulo}/{Entidad}Controller.php`
- [ ] `app/Http/Requests/{Modulo}/Store{Entidad}Request.php`
- [ ] `app/Http/Requests/{Modulo}/Update{Entidad}Request.php`
- [ ] `app/Http/Resources/{Modulo}/{Entidad}Resource.php`
- [ ] `app/Policies/{Entidad}Policy.php`
- [ ] Permisos `{modulo}.view|create|update|delete|restore|activate`
- [ ] Rutas en `routes/api.php`

---

## Checklist — archivos frontend

- [ ] `modules/{modulo}/pages/` — List, Create, Edit, Detail, Deleted (5)
- [ ] `modules/{modulo}/components/` — Table, Form, FiltersBar, Toolbar, StatusBadge
- [ ] `modules/{modulo}/hooks/` — list, create, update, delete
- [ ] `modules/{modulo}/services/{entidad}Service.ts`
- [ ] `modules/{modulo}/types/`, `utils/`, `routes/`, `permissions/`, `constants/`, `index.ts`
- [ ] Rutas en `App.tsx`
- [ ] `config/breadcrumbs.ts`
- [ ] PermissionGate en acciones sensibles

---

## Checklist — documentación post-módulo

- [ ] `docs/12_DATABASE/{Dominio}.md` — marcar tabla implementada
- [ ] `docs/06_MODULES_INDEX.md` — fila del módulo
- [ ] `docs/08_PROJECT_STATUS.md` — snapshot
- [ ] `docs/CHANGELOG.md` — entrada con fecha

**No** actualizar `02_DATABASE_SCHEMA.md` con definiciones de tabla.

---

## Dependencias típicas

| Paso | Depende de |
|------|------------|
| Frontend CRUD | API + permisos en seeders |
| Permisos UI | Login persiste `permissions` en localStorage |
| Catálogo | Spec en `12_DATABASE/01_Catalogos.md` |
| Entidad con FK | Tabla padre implementada + spec en dominio correspondiente |

---

## Comandos post-implementación

```bash
cd backend && php artisan migrate && php artisan db:seed
cd frontend && npm run build
```

---

## Excepciones

Módulos transaccionales (Animales, Movimientos) extienden la plantilla con relaciones y validaciones de dominio, pero **mantienen la misma estructura de carpetas**.
