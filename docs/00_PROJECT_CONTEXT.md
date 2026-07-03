# Contexto del Proyecto — sisganaderia

> **Único doc operativo de visión general.** Convenciones y arquitectura viven en `.cursor/rules/`.

**Última actualización:** 2026-06-28

---

## Qué es

Sistema de gestión ganadera (Agropecuaria Harrison). Monorepo Laravel 12 + React 19 + PostgreSQL + Sanctum + Spatie Permission.

## Stack (referencia rápida)

| Capa | Tecnología |
|------|------------|
| Backend | PHP 8.2+, Laravel 12, Sanctum 4, Spatie Permission 6 |
| Frontend | React 19, TS 5.7, Vite 6, Tailwind 4, React Router 7 |
| BD | PostgreSQL (`DB_CONNECTION=pgsql`) |
| UI base | TailAdmin 2.3 |

## Estado actual (~28–32%)

| Área | Implementado |
|------|--------------|
| Plataforma | Auth, Usuarios, RBAC, PermissionGate |
| Catálogos | **Razas**, **Categorías de Animales** |
| Pendiente | Lotes, Animales, sanitario, movimientos, reproducción, reportes |

**Detalle vivo:** `docs/06_MODULES_INDEX.md`, `docs/08_PROJECT_STATUS.md`

## Módulo patrón

**Razas** — referencia obligatoria para nuevos módulos CRUD:

- Backend: `backend/app/Http/Controllers/Api/Razas/`, `Services/Razas/`, etc.
- Frontend: `frontend/src/modules/razas/`

## Entorno local

```bash
# Backend
cd backend && composer install && cp .env.example .env
# Configurar DB_* PostgreSQL
php artisan key:generate && php artisan migrate && php artisan db:seed
php artisan serve   # :8000

# Frontend
cd frontend && npm install && npm run dev   # :5173
```

**Login dev:** `admin@gmail.com` / `12345678`

## Documentación — qué usar

| Necesidad | Archivo |
|-----------|---------|
| Crear módulo | `docs/11_MODULE_TEMPLATE.md` + `docs/12_DATABASE/{Dominio}.md` + Razas |
| Modelo de datos | `docs/12_DATABASE/` (única fuente de tablas) |
| Estado de módulos | `docs/06_MODULES_INDEX.md` |
| Cambios recientes | `docs/CHANGELOG.md` |
| Histórico / roadmap | `docs/_archive/` (solo si el usuario lo pide) |
