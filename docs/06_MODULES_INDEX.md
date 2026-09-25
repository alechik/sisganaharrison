# Índice de Módulos

> Tabla viva de estado. Detalle de implementación: código fuente + `docs/12_DATABASE/`.

**Leyenda:** ✅ Implementado · 🟡 Parcial · ❌ Pendiente

| Módulo | Estado | API prefix | Permisos | Ref código |
|--------|--------|------------|----------|------------|
| Auth | 🟡 | `/api/auth` | — | `AuthController`, `SignInForm` |
| Usuarios | ✅ | `/api/usuarios` | `usuarios.*` | `modules/user/` |
| Socios de Negocios | ✅ | `/api/socios`, `/api/tipos-persona` | `socios.*`, `tipos_persona.*` | `modules/socios-de-negocio/` (lista unificada Cliente/Proveedor/Ambos) |
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
| Animales | ✅ | `/api/animales` | `animales.*` | `modules/animales/` (código, sexo, categoría; `user_id`, `edad_inicial`/`edad_actual` en meses, `precio_kilo` nullable) |
| Pesajes | ✅ | `/api/pesajes` | `pesajes.view`, `pesajes.create` | `modules/pesajes/` (append only; pesaje de nacimiento vía observaciones) |
| Eventos Sanitarios | ✅ | `/api/eventos-sanitarios` | `sanitario.view`, `sanitario.create` | `modules/eventos-sanitarios/` (append only) |
| Servicios Reproductivos | ✅ | `/api/servicios-reproductivos` | `reproduccion.view`, `reproduccion.create`, `reproduccion.update` | `modules/servicios-reproductivos/` (hembra/macho con arete) |
| Gestaciones | ✅ | `/api/gestaciones` | `reproduccion.view`, `reproduccion.create`, `reproduccion.update` | `modules/gestaciones/` (servicio PREÑADA sin gestación; ACTIVA hasta parto) |
| Partos | ✅ | `/api/partos` | `reproduccion.view`, `reproduccion.create`, `reproduccion.update` | `modules/partos/` (`PENDIENTE`/`FINALIZADA`; finalizar manual; gestación a FINALIZADA al crear) |
| Nacimientos | ✅ | `/api/nacimientos` | `reproduccion.view`, `reproduccion.create`, `reproduccion.update` | `modules/nacimientos/` (parto PENDIENTE; VIVO crea cría + pesaje; MUERTO sin animal) |
| Compras / Órdenes de Compra | ✅ | `/api/compras/ordenes-compra` | `compras.view`, `compras.create`, `compras.update`, `compras.authorize` | `modules/compras/` (animal preliminar + edad inicial) |
| Compras / Cuarentenas | ✅ | `/api/compras/cuarentenas` | `compras.view`, `compras.create` | `modules/compras/` (COMPLETADO registra pesaje de cuarentena) |
| Compras / Ingresos | ✅ | `/api/compras/ingresos` | `compras.view`, `compras.create` | `modules/compras/` (parciales desde cuarentena COMPLETADA; actualiza el mismo `animal_id`; `precio_kilo` = `precio_compra` / `peso_ingreso`) |
| Movimientos | ❌ | — | permisos seed | — |
| Reportes | ❌ | — | permisos seed | — |
| Auditoría | ❌ | — | permisos seed | — |

## Spec BD por dominio

Ver `docs/02_DATABASE_SCHEMA.md` → `docs/12_DATABASE/`.

## Histórico detallado

Desglose archivo-por-archivo archivado en `docs/_archive/06_MODULES_INDEX.full.md` (solo referencia humana).
