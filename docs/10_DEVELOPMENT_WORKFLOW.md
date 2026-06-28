# Flujo de Desarrollo

> Procedimiento obligatorio para cualquier cambio en el proyecto.

---

## 1. Antes de implementar

1. **Leer la carpeta `docs/`** completa o los documentos relevantes:
   - `00_CONTEXTO_PROYECTO.md` — visión general
   - `06_MODULES_INDEX.md` — estado del módulo a modificar
   - `04_PROJECT_RULES.md` — reglas obligatorias
   - `05_API_CONVENTIONS.md` — si se toca la API
   - `02_DATABASE_SCHEMA.md` — si se toca la BD

2. **Verificar el estado real** en `08_PROJECT_STATUS.md` y `07_ROADMAP.md`.

3. **Confirmar que la fase actual está cerrada** antes de avanzar a la siguiente.

---

## 2. Durante la implementación

4. **Implementar una única fase o módulo a la vez.** No mezclar plataforma con dominio ganadero.

5. **Seguir patrones existentes:**
   - Backend: Controller → FormRequest → Policy → Service → Resource
   - Frontend: `modules/{dominio}/` con pages, services, hooks, types

6. **Aplicar RBAC desde el inicio:**
   - Permiso en PermissionSeeder (si nuevo)
   - Middleware en ruta
   - Policy en modelo
   - PermissionGate en UI (cuando exista)

7. **No modificar convenciones** sin actualizar `03_CODING_STANDARDS.md` y `09_ARCHITECTURE_DECISIONS.md`.

---

## 3. Después de implementar

8. **Actualizar documentación:**
   - `08_PROJECT_STATUS.md` — qué cambió
   - `06_MODULES_INDEX.md` — estado del módulo
   - `CHANGELOG.md` — entrada con fecha y descripción
   - `02_DATABASE_SCHEMA.md` — si hay migraciones nuevas
   - `05_API_CONVENTIONS.md` — si hay endpoints nuevos

9. **Ejecutar verificación local:**

```bash
# Backend
cd backend
php artisan migrate
php artisan db:seed          # Si cambiaron seeders
php artisan test             # Cuando existan tests

# Frontend
cd frontend
npm run build                # Verificar compilación TypeScript
```

10. **No continuar** con la siguiente fase hasta validar la actual.

---

## 4. Entorno local

### Backend

```bash
cd backend
composer install
cp .env.example .env
# Editar DB_* para PostgreSQL
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve            # http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

### Script dev backend (opcional)

```bash
cd backend
composer dev                 # serve + queue + pail + vite concurrently
```

---

## 5. Pruebas manuales mínimas (plataforma actual)

1. Login `admin@gmail.com` / `12345678` → token + permissions
2. `GET /api/usuarios` como super-admin → 200 paginado
3. `GET /api/usuarios` como trabajador@gmail.com → 403
4. CRUD usuarios en UI: crear → editar → desactivar → eliminar → restaurar
5. Intentar eliminarse a sí mismo → 403
6. Logout → token invalidado

---

## 6. Commits

- Mensajes descriptivos en español o inglés (seguir estilo del repo).
- No commitear `.env`, credenciales ni `vendor/` / `node_modules/`.
- Solo crear commits cuando el usuario lo solicite explícitamente.

---

## 7. Estado actual del flujo

**El proyecto está en estado "DOCUMENTACIÓN CONSOLIDADA".**

Esperar nueva instrucción antes de comenzar implementación de Fase 1.3 o superior.
