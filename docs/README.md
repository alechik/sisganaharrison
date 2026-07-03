# Documentación — sisganaderia

## Contexto obligatorio (Agent)

Leer **solo** lo necesario por tarea. Nunca analizar `docs/` completa por defecto.

| Prioridad | Archivo | Uso |
|-----------|---------|-----|
| Auto | `.cursor/rules/` | Convenciones permanentes |
| 1 | `00_PROJECT_CONTEXT.md` | Visión, stack, estado, entorno |
| 2 | `11_MODULE_TEMPLATE.md` | Checklist y orden de nuevo módulo |
| 3 | `12_DATABASE/{Dominio}.md` | Spec de tablas |
| 4 | `06_MODULES_INDEX.md` | Estado por módulo (tabla) |
| 5 | `08_PROJECT_STATUS.md` | Snapshot global |
| 6 | `CHANGELOG.md` | Historial de cambios |

**Índice BD:** `02_DATABASE_SCHEMA.md` → enlaces a `12_DATABASE/`

**Referencia de código:** `frontend/src/modules/razas/` + backend Razas

---

## Documentación histórica

`docs/_archive/` — reconstrucción inicial, roadmap, workflow, API detallada, arquitectura extendida.

**No leer** salvo petición explícita del usuario.

---

## Flujo Agent recomendado

### Crear módulo CRUD

1. `.cursor/rules/` (automático)
2. `00_PROJECT_CONTEXT.md`
3. `11_MODULE_TEMPLATE.md`
4. `12_DATABASE/{Dominio}.md`
5. Copiar patrón desde `modules/razas/`
6. Actualizar: `06`, `08`, `CHANGELOG`, spec BD

### Corregir bug

1. Rules + código del módulo afectado
2. `06_MODULES_INDEX.md` (1 fila) si hay duda de estado

### Crear migración

1. `12_DATABASE/{Dominio}.md`
2. Migración patrón (`razas` o `categorias_animales`)
3. Actualizar spec en `12_DATABASE/`

### Crear API

1. Rules + `RazaController` / `RazaService` como ref.

### Crear pantalla React

1. Rules + `frontend/src/modules/razas/`
