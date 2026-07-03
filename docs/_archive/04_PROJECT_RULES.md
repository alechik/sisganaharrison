# Reglas del Proyecto

> Reglas oficiales derivadas de la arquitectura y convenciones existentes.  
> Todo desarrollador o agente de IA **debe** cumplirlas.

---

## 1. Documentación

1. **Leer `docs/` antes de programar.** Es la única fuente oficial de conocimiento.
2. **Consultar `06_MODULES_INDEX.md`** para conocer el estado real de cada módulo.
3. **Actualizar documentación** al finalizar cada fase o módulo:
   - `08_PROJECT_STATUS.md`
   - `06_MODULES_INDEX.md`
   - `CHANGELOG.md`
4. **No documentar funcionalidades inexistentes.** Solo describir lo implementado.

---

## 2. Arquitectura

5. **Mantener el monorepo** `backend/` + `frontend/`. No crear proyectos separados.
6. **Seguir arquitectura modular en frontend:** replicar patrón `modules/user/` para cada dominio nuevo.
7. **API REST JSON** en backend. Frontend consume vía Axios con token Bearer.
8. **Un módulo a la vez.** No avanzar a dominio ganadero sin consolidar plataforma pendiente.
9. **PostgreSQL** como motor de base de datos (según `.env.example`).

---

## 3. Backend — capas obligatorias

10. **FormRequest** para toda validación de entrada en endpoints de escritura.
11. **Policy** para autorización a nivel de modelo (además de middleware de permisos).
12. **Resource** para transformar respuestas JSON de entidades.
13. **Service** cuando exista lógica de negocio transversal o reglas de protección (como `UserProtectionService`).
14. **Middleware `permission:`** en rutas que requieran permiso específico.
15. **Doble capa de seguridad:** middleware + policy + authorize en FormRequest.

---

## 4. Autenticación y autorización

16. **Sanctum** para tokens API. Header: `Authorization: Bearer {token}`.
17. **Spatie Permission** con `guard_name = 'web'`. No usar guard `api`.
18. **Convención de permisos:** `{modulo}.{accion}`.
19. **`Gate::before`** para bypass de `super-admin`. No duplicar lógica de bypass en policies.
20. **Registro público deshabilitado.** Creación de usuarios solo vía módulo admin con permiso `usuarios.create`.
21. **Revocar tokens** al eliminar o desactivar usuario.
22. **Soft delete** en entidades maestras. Separar `estado` (activo/inactivo) de `deleted_at`.

---

## 5. API

23. **Contrato paginado estándar** en todos los listados:
    ```json
    { "data": [], "meta": {}, "links": {} }
    ```
24. **Query params de paginación:** `page`, `per_page`.
25. **Mensajes de respuesta en español.**
26. **Rutas específicas antes de rutas con parámetros** (ej: `/usuarios/eliminados` antes de `/usuarios/{user}`).
27. **No crear endpoints** sin permiso RBAC correspondiente en seeders.

---

## 6. Frontend

28. **Alias `@/`** para imports desde `src/`.
29. **Servicios API** por módulo en `modules/{dominio}/services/`.
30. **Tipos TypeScript** por módulo en `modules/{dominio}/types/`.
31. **Hooks** para lógica de fetching y estado de listados.
32. **ProtectedRoute** para rutas autenticadas (mejorar con AuthContext cuando se implemente).
33. **Permisos en UI:** ocultar acciones según permisos del usuario (pendiente: `PermissionGate`).
34. **No hardcodear URLs de API** fuera de `api/axios.ts`.

---

## 7. Base de datos

35. **Migraciones incrementales.** Una migración por cambio de esquema.
36. **Seeders idempotentes** con `firstOrCreate` / `syncPermissions`.
37. **Ejecutar seeders** tras cambios en permisos o roles.
38. **Factory alineada al esquema** (`UserFactory` usa `nombre`, `apellido`, `estado`).

---

## 8. Calidad y seguridad

39. **No auto-eliminarse ni auto-desactivarse** (regla ya implementada en usuarios).
40. **Proteger último super-admin activo** (regla ya implementada).
41. **Validar permisos en backend** aunque el frontend oculte botones.
42. **No commitear `.env`** ni credenciales.
43. **Tests Feature** para auth, usuarios y permisos (pendiente de implementar).

---

## 9. Prohibiciones

44. **No inventar módulos** no respaldados por código o documentación aprobada.
45. **No saltar fases** del roadmap sin cerrar la fase anterior.
46. **No usar `$guarded = []`** en modelos; preferir `$fillable` explícito.
47. **No eliminar rutas de registro** (responden 403; mantener compatibilidad).
48. **No mezclar lógica de negocio compleja** en controladores; extraer a Services.

---

## 10. Flujo de trabajo

Ver [10_DEVELOPMENT_WORKFLOW.md](./10_DEVELOPMENT_WORKFLOW.md).
