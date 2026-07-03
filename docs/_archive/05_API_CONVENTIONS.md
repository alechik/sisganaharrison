# Convenciones API

> Documenta **únicamente** los endpoints implementados en `backend/routes/api.php`.  
> Base URL: `http://127.0.0.1:8000/api`

---

## 1. Autenticación

Todas las rutas privadas requieren header:

```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

---

## 2. Auth — `/api/auth`

### POST `/auth/login` — Público

**Request:**
```json
{
  "email": "admin@gmail.com",
  "password": "12345678"
}
```

**Validación:**
- `email`: required, email
- `password`: required

**Respuesta 200:**
```json
{
  "message": "Login correcto",
  "token": "1|...",
  "user": {
    "id": 1,
    "nombre": "Administrador",
    "apellido": "Admin",
    "email": "admin@gmail.com",
    "telefono": null,
    "estado": true,
    "nombre_completo": "Administrador Admin",
    "email_verified_at": null,
    "created_at": "...",
    "updated_at": "...",
    "deleted_at": null
  },
  "roles": ["super-admin"],
  "permissions": ["usuarios.view", "usuarios.create", "..."]
}
```

**Errores:**
| Código | Condición | Mensaje |
|--------|-----------|---------|
| 401 | Credenciales inválidas | `Credenciales incorrectas` |
| 403 | Usuario inactivo | `Usuario inactivo` |
| 422 | Validación fallida | Errores Laravel estándar |

---

### POST `/auth/register` — Público (deshabilitado)

**Respuesta 403:**
```json
{
  "message": "Registro público deshabilitado. Solicite acceso al administrador o use el módulo de usuarios."
}
```

---

### GET `/auth/me` — Privado

**Respuesta 200:**
```json
{
  "user": { ... },
  "roles": ["super-admin"],
  "permissions": ["usuarios.view", "..."]
}
```

**Errores:**
| Código | Condición |
|--------|-----------|
| 401 | Token inválido o ausente |

---

### POST `/auth/logout` — Privado

**Respuesta 200:**
```json
{
  "message": "Sesión cerrada"
}
```

Elimina el token actual del usuario.

---

### POST `/auth/change-password` — Privado

**Request:**
```json
{
  "current_password": "12345678",
  "new_password": "nueva123",
  "new_password_confirmation": "nueva123"
}
```

**Validación:**
- `current_password`: required
- `new_password`: required, min:8, confirmed

**Respuesta 200:**
```json
{
  "message": "Contraseña actualizada correctamente"
}
```

**Errores:**
| Código | Condición | Mensaje |
|--------|-----------|---------|
| 400 | Contraseña actual incorrecta | `La contraseña actual no es correcta` |
| 422 | Validación fallida | Errores Laravel estándar |

---

## 3. Usuarios — `/api/usuarios`

Todas requieren `auth:sanctum` + permiso indicado.

### GET `/usuarios` — Permiso: `usuarios.view`

**Query params:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| page | int | Página (default paginator: 1) |
| per_page | int | Registros por página (default: 10) |
| search | string | Busca en nombre, apellido, email |
| estado | boolean | Filtra por activo/inactivo |

**Respuesta 200 (paginada):**
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Administrador",
      "apellido": "Admin",
      "email": "admin@gmail.com",
      "telefono": null,
      "estado": true,
      "roles": [{ "id": 1, "name": "super-admin" }]
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 10,
    "total": 3,
    "from": 1,
    "to": 3
  },
  "links": {
    "first": "...",
    "last": "...",
    "prev": null,
    "next": null
  }
}
```

---

### POST `/usuarios` — Permiso: `usuarios.create`

**Request:**
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@example.com",
  "telefono": "0981123456",
  "password": "123456",
  "roles": ["trabajador"]
}
```

**Validación (StoreUserRequest):**
| Campo | Reglas |
|-------|--------|
| nombre | required, string, max:100 |
| apellido | required, string, max:100 |
| email | required, email, unique:users |
| telefono | nullable, string, max:20 |
| password | required, min:6 |
| roles | required, array |

**Respuesta 201:**
```json
{
  "message": "Usuario creado correctamente",
  "user": { ... UserResource ... }
}
```

---

### GET `/usuarios/{user}` — Permiso: `usuarios.view`

**Respuesta 200:**
```json
{
  "data": {
    "id": 1,
    "nombre": "...",
    "apellido": "...",
    "email": "...",
    "telefono": null,
    "estado": true,
    "roles": [{ "id": 1, "name": "super-admin" }]
  }
}
```

---

### PUT/PATCH `/usuarios/{user}` — Permiso: `usuarios.update`

**Request:** Mismos campos que store; `password` nullable min:6.

**Respuesta 200:**
```json
{
  "message": "Usuario actualizado correctamente",
  "user": { ... }
}
```

**Errores 403:**
- `No se puede quitar el rol super-admin al último super-admin activo.`

---

### DELETE `/usuarios/{user}` — Permiso: `usuarios.delete`

Soft delete. Desactiva (`estado = false`), revoca tokens y marca `deleted_at`.

**Respuesta 200:**
```json
{
  "message": "Usuario eliminado correctamente"
}
```

**Errores 403:**
- `No puede eliminarse a sí mismo.`
- `No se puede eliminar el último super-admin activo.`

---

### PATCH `/usuarios/{user}/estado` — Permiso: `usuarios.activate`

Alterna `estado`. Si desactiva, revoca tokens.

**Respuesta 200:**
```json
{
  "message": "Estado actualizado",
  "user": { ... }
}
```

**Errores 403:**
- `No puede desactivarse a sí mismo.`
- `No se puede desactivar el último super-admin activo.`

---

### GET `/usuarios/eliminados` — Permiso: `usuarios.view`

Listado paginado de usuarios con soft delete. Mismo formato paginado que index.

**Query params:** `page`, `per_page`

---

### POST `/usuarios/{id}/restaurar` — Permiso: `usuarios.restore`

**Respuesta 200:**
```json
{
  "message": "Usuario restaurado correctamente",
  "user": { ... }
}
```

---

## 4. Roles — `/api/roles`

### GET `/roles` — Permiso: `usuarios.view`

**Respuesta 200:** Array directo de roles Spatie (sin wrapper Resource).

```json
[
  { "id": 1, "name": "super-admin", "guard_name": "web", "created_at": "...", "updated_at": "..." },
  { "id": 2, "name": "administrador", "guard_name": "web", ... }
]
```

---

## 5. Formato de errores

### Errores de autorización (403)

Spatie/Laravel devuelve 403 sin cuerpo JSON personalizado en algunos casos de middleware.

Errores de negocio devuelven:
```json
{ "message": "Descripción del error" }
```

### Errores de validación (422)

Formato Laravel estándar:
```json
{
  "message": "The email field is required.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

### Errores de autenticación (401)

```json
{ "message": "Unauthenticated." }
```

---

## 6. Paginación — contrato estándar

Todos los listados paginados usan el formato de Laravel API Resources:

```json
{
  "data": [],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 10,
    "total": 0,
    "from": null,
    "to": null
  },
  "links": {
    "first": "http://...",
    "last": "http://...",
    "prev": null,
    "next": null
  }
}
```

**Default `per_page`:** 10 (definido en controlador).

---

## 7. Notas

- El endpoint `show` devuelve `{ data: UserResource }` (wrapper `data` de JsonResource).
- Login devuelve el modelo User completo (no UserResource).
- Permisos en login/me: array de strings con nombres de permiso.
- Roles en login/me: array de strings con nombres de rol.
- **No existen más endpoints API** en el código actual.
