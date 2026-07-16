# Modelo de Datos — Índice

Fuente **única y oficial** de especificación de tablas para sisganaderia.

| Archivo | Dominio | Estado |
|---------|---------|--------|
| [00_Plataforma.md](./00_Plataforma.md) | Auth, RBAC, infra Laravel | Implementado |
| [01_Catalogos.md](./01_Catalogos.md) | Catálogos maestros (razas, categorías, …) | Implementado |
| [02_Infraestructura.md](./02_Infraestructura.md) | Establecimientos, potreros, lotes | Implementado |
| [03_Nucleo_Ganadero.md](./03_Nucleo_Ganadero.md) | Animales, movimientos, sanitario | Parcial (Animales implementado) |
| [04_Reproduccion.md](./04_Reproduccion.md) | Ciclo reproductivo, partos, nacimientos | Pendiente |
| [05_Gestion.md](./05_Gestion.md) | Alertas, indicadores, reportes | Pendiente |

Navegación desde raíz: `docs/02_DATABASE_SCHEMA.md`

**Regla:** no duplicar definiciones de tablas en otros documentos del proyecto.

---

# Cadena reproductiva oficial

```
Servicio → Gestación → Parto → Nacimiento → Animal
```

El parto no se relaciona directamente con `animales`.

---

# Cobertura de Requerimientos Funcionales

| RF | Descripción | Dominio / Tablas |
|----|-------------|------------------|
| RF-01 | Gestión de Usuarios | `00_Plataforma` → users |
| RF-02 | Autenticación | `00_Plataforma` → Sanctum, sessions |
| RF-03 | Roles y Permisos | `00_Plataforma` → Spatie |
| RF-04 | Registro de Ganado | `animales` |
| RF-05 | Historial Completo | `animal_eventos`, `pesajes`, `eventos_sanitarios`, `movimientos_animales`, `nacimientos` |
| RF-06 | Eventos Reproductivos | `servicios_reproductivos` |
| RF-07 | Seguimiento Reproductivo | `gestaciones` |
| RF-08 | Registro Sanitario | `eventos_sanitarios` |
| RF-09 | Historial Sanitario | `eventos_sanitarios` |
| RF-10 | Movimientos | `movimientos_animales` |
| RF-11 | Ubicación Histórica | `movimientos_animales` (lote origen/destino) |
| RF-12 | Control de Nacimientos | `partos`, `nacimientos` |
| RF-13 | Mortalidad y Pérdidas | `nacimientos` (al nacer), `movimientos_animales` Muerte/Baja |
| RF-14 | Compras y Ventas | `movimientos_animales` + campos comerciales |
| RF-15 | Control de Existencias | Cálculo sobre `animales`, `nacimientos`, `movimientos_animales` |
| RF-16 | Reportes | `reportes_generados` |
| RF-17 | Exportaciones | `reportes_generados.formato`, `archivo` |
| RF-18 | Dashboard Gerencial | `indicadores_productivos`, `alertas`, agregaciones |

---

# Principios del modelo

- Normalización alta; sin tablas de inventario redundantes.
- Trazabilidad append-only en históricos.
- Reutilización de `movimientos_animales` para traslados, compras, ventas, muerte y pérdidas.
- Reutilización de `nacimientos` para natalidad, mortalidad al nacer y vínculo con animales.
- Sin duplicar en `animales` datos derivables de movimientos o nacimientos.
