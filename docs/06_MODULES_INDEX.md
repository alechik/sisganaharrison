# Índice de Módulos

> Tabla viva de estado. Detalle de implementación: código fuente + `docs/12_DATABASE/`.

**Leyenda:** ✅ Implementado · 🟡 Parcial · ❌ Pendiente

| Módulo | Estado | API prefix | Permisos | Ref código |
|--------|--------|------------|----------|------------|
| Auth | 🟡 | `/api/auth` | — | `AuthController`, `SignInForm` |
| Usuarios | ✅ | `/api/usuarios` | `usuarios.*` | `modules/user/` |
| Razas | ✅ | `/api/razas` | `razas.*` | `modules/razas/` **← patrón** |
| Categorías Animales | ✅ | `/api/categorias-animales` | `categorias_animales.*` | `modules/categorias-animales/` |
| Vacunas | ✅ | `/api/vacunas` | `vacunas.*` | `modules/vacunas/` |
| Lotes | ❌ | — | `lotes.*` (seed) | — |
| Animales | ❌ | — | `animales.*` (seed) | — |
| Sanitario | ❌ | — | permisos seed | — |
| Movimientos | ❌ | — | permisos seed | — |
| Reproducción | ❌ | — | permisos seed | — |
| Reportes | ❌ | — | permisos seed | — |
| Auditoría | ❌ | — | permisos seed | — |

## Spec BD por dominio

Ver `docs/02_DATABASE_SCHEMA.md` → `docs/12_DATABASE/`.

## Histórico detallado

Desglose archivo-por-archivo archivado en `docs/_archive/06_MODULES_INDEX.full.md` (solo referencia humana).
