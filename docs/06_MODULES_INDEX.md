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
| Estados Productivos | ✅ | `/api/estados-productivos` | `estados_productivos.*` | `modules/estados-productivos/` |
| Tipos Eventos Sanitarios | ✅ | `/api/tipos-eventos-sanitarios` | `tipos_eventos_sanitarios.*` | `modules/tipos-eventos-sanitarios/` |
| Tipos Movimientos | ✅ | `/api/tipos-movimientos` | `tipos_movimientos.*` | `modules/tipos-movimientos/` |
| Tipos Alertas | ✅ | `/api/tipos-alertas` | `tipos_alertas.*` | `modules/tipos-alertas/` |
| Establecimientos | ✅ | `/api/establecimientos` | `establecimientos.*` | `modules/establecimientos/` |
| Potreros | ✅ | `/api/potreros` | `potreros.*` | `modules/potreros/` |
| Lotes | ✅ | `/api/lotes` | `lotes.*` | `modules/lotes/` |
| Animales | ✅ | `/api/animales` | `animales.*` | `modules/animales/` |
| Pesajes | ✅ | `/api/pesajes` | `pesajes.view`, `pesajes.create` | `modules/pesajes/` (append only) |
| Eventos Sanitarios | ✅ | `/api/eventos-sanitarios` | `sanitario.view`, `sanitario.create` | `modules/eventos-sanitarios/` (append only) |
| Servicios Reproductivos | ✅ | `/api/servicios-reproductivos` | `reproduccion.view`, `reproduccion.create`, `reproduccion.update` | `modules/servicios-reproductivos/` |
| Gestaciones | ✅ | `/api/gestaciones` | `reproduccion.view`, `reproduccion.create`, `reproduccion.update` | `modules/gestaciones/` (sin delete) |
| Movimientos | ❌ | — | permisos seed | — |
| Reportes | ❌ | — | permisos seed | — |
| Auditoría | ❌ | — | permisos seed | — |

## Spec BD por dominio

Ver `docs/02_DATABASE_SCHEMA.md` → `docs/12_DATABASE/`.

## Histórico detallado

Desglose archivo-por-archivo archivado en `docs/_archive/06_MODULES_INDEX.full.md` (solo referencia humana).
