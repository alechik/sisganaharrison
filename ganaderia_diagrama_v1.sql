-- ============================================================
-- BASE DE DATOS GENERADA A PARTIR DEL DIAGRAMA DE CLASES V1
-- Motor: PostgreSQL
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- TIPOS / CATÁLOGOS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tipo (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS permisos (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    guard_name VARCHAR(255) NOT NULL DEFAULT 'web',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    guard_name VARCHAR(255) NOT NULL DEFAULT 'web',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS razas (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(20),
    descripcion TEXT,
    estado BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS categoria_animales (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS vacunas (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    laboratorio VARCHAR(120),
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS estados_productivos (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS tipos_eventos_sanitarios (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS establecimientos (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    propietario VARCHAR(150),
    telefono VARCHAR(30),
    direccion VARCHAR(255),
    municipio VARCHAR(100),
    departamento VARCHAR(100),
    pais VARCHAR(100),
    area_total NUMERIC(10,2),
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS potreros (
    id BIGSERIAL PRIMARY KEY,
    establecimiento_id BIGINT NOT NULL,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    area_ha NUMERIC(10,2),
    tipo_pasto VARCHAR(100),
    disponibilidad BOOLEAN NOT NULL DEFAULT TRUE,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_potreros_establecimiento
        FOREIGN KEY (establecimiento_id)
        REFERENCES establecimientos(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS lotes (
    id BIGSERIAL PRIMARY KEY,
    potrero_id BIGINT NOT NULL,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    capacidad_animales INTEGER NOT NULL DEFAULT 0,
    area_ha NUMERIC(10,2),
    observaciones TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_lotes_potrero
        FOREIGN KEY (potrero_id)
        REFERENCES potreros(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS personas (
    id BIGSERIAL PRIMARY KEY,
    razon_social VARCHAR(255) NOT NULL,
    responsable VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    fecha_nacimiento DATE,
    ci INTEGER,
    nit VARCHAR(30),
    celular INTEGER,
    estado_civil VARCHAR(30),
    sexo VARCHAR(30),
    direccion VARCHAR(100),
    estado VARCHAR(25),
    fecha_reg DATE,
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_personas_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS personas_tipo (
    id BIGSERIAL PRIMARY KEY,
    persona_id BIGINT NOT NULL,
    rol_id BIGINT NOT NULL,
    CONSTRAINT fk_personas_tipo_persona
        FOREIGN KEY (persona_id)
        REFERENCES personas(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_personas_tipo_rol
        FOREIGN KEY (rol_id)
        REFERENCES tipo(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT uq_persona_tipo UNIQUE (persona_id, rol_id)
);

-- ------------------------------------------------------------
-- ANIMALES
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS animals (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(30) UNIQUE,
    arete VARCHAR(30) UNIQUE,
    nombre VARCHAR(100),
    sexo VARCHAR(1) NOT NULL CHECK (sexo IN ('M','H')),
    fecha_nacimiento DATE,
    color VARCHAR(60),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    raza_id BIGINT NOT NULL,
    categoria_id BIGINT NOT NULL,
    estado_productivo_id BIGINT,
    lote_id BIGINT,
    madre_id BIGINT,
    padre_id BIGINT,
    user_id BIGINT NOT NULL,
    edad_inicial INTEGER,
    edad_actual INTEGER,
    CONSTRAINT fk_animals_raza
        FOREIGN KEY (raza_id)
        REFERENCES razas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_animals_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categoria_animales(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_animals_estado_productivo
        FOREIGN KEY (estado_productivo_id)
        REFERENCES estados_productivos(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_animals_lote
        FOREIGN KEY (lote_id)
        REFERENCES lotes(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_animals_madre
        FOREIGN KEY (madre_id)
        REFERENCES animals(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_animals_padre
        FOREIGN KEY (padre_id)
        REFERENCES animals(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_animals_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS pesajes (
    id BIGSERIAL PRIMARY KEY,
    animal_id BIGINT NOT NULL,
    fecha DATE NOT NULL,
    peso NUMERIC(8,2) NOT NULL,
    observacion TEXT,
    CONSTRAINT fk_pesajes_animal
        FOREIGN KEY (animal_id)
        REFERENCES animals(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- SANIDAD
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS eventos_sanitarios (
    id BIGSERIAL PRIMARY KEY,
    animal_id BIGINT NOT NULL,
    tipo_evento_id BIGINT NOT NULL,
    vacuna_id BIGINT NOT NULL,
    fecha DATE NOT NULL,
    diagnostico TEXT,
    tratamiento TEXT,
    observaciones TEXT,
    CONSTRAINT fk_eventos_sanitarios_animal
        FOREIGN KEY (animal_id)
        REFERENCES animals(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_eventos_sanitarios_tipo
        FOREIGN KEY (tipo_evento_id)
        REFERENCES tipos_eventos_sanitarios(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_eventos_sanitarios_vacuna
        FOREIGN KEY (vacuna_id)
        REFERENCES vacunas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS animal_eventos (
    id BIGSERIAL PRIMARY KEY,
    animal_id BIGINT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    fecha DATE NOT NULL,
    descripcion TEXT,
    metadata JSONB,
    CONSTRAINT fk_animal_eventos_animal
        FOREIGN KEY (animal_id)
        REFERENCES animals(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- REPRODUCCIÓN
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS servicios_reproductivos (
    id BIGSERIAL PRIMARY KEY,
    hembra_id BIGINT NOT NULL,
    macho_id BIGINT NOT NULL,
    fecha_servicio DATE NOT NULL,
    tipo_servicio VARCHAR(30) NOT NULL,
    resultado VARCHAR(30),
    observaciones TEXT,
    CONSTRAINT fk_servicios_hembra
        FOREIGN KEY (hembra_id)
        REFERENCES animals(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_servicios_macho
        FOREIGN KEY (macho_id)
        REFERENCES animals(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS gestaciones (
    id BIGSERIAL PRIMARY KEY,
    servicio_id BIGINT NOT NULL,
    fecha_confirmacion DATE,
    fecha_probable_parto DATE,
    estado VARCHAR(30) NOT NULL,
    observaciones TEXT,
    CONSTRAINT fk_gestaciones_servicio
        FOREIGN KEY (servicio_id)
        REFERENCES servicios_reproductivos(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS partos (
    id BIGSERIAL PRIMARY KEY,
    gestacion_id BIGINT NOT NULL,
    fecha_parto DATE NOT NULL,
    observaciones TEXT,
    CONSTRAINT fk_partos_gestacion
        FOREIGN KEY (gestacion_id)
        REFERENCES gestaciones(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS nacimientos (
    id BIGSERIAL PRIMARY KEY,
    parto_id BIGINT NOT NULL,
    animal_id BIGINT NOT NULL,
    arete VARCHAR(30),
    sexo CHAR(1) NOT NULL CHECK (sexo IN ('M','H')),
    peso_nacimiento NUMERIC(8,2),
    estado_nacimiento VARCHAR(10),
    causa_muerte VARCHAR(150),
    observaciones TEXT,
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_nacimientos_parto
        FOREIGN KEY (parto_id)
        REFERENCES partos(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_nacimientos_animal
        FOREIGN KEY (animal_id)
        REFERENCES animals(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_nacimientos_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- COMPRAS / INGRESO / CUARENTENA
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS orden_compras (
    id BIGSERIAL PRIMARY KEY,
    proveedor_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    cod_compra VARCHAR(20) NOT NULL,
    fecha DATE NOT NULL,
    estado VARCHAR(50) NOT NULL,
    descuento NUMERIC(8,2) NOT NULL DEFAULT 0,
    total_peso NUMERIC(8,2),
    monto_total NUMERIC(8,2),
    CONSTRAINT fk_orden_compras_proveedor
        FOREIGN KEY (proveedor_id)
        REFERENCES personas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_orden_compras_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS detalle_orden_compra (
    id BIGSERIAL PRIMARY KEY,
    orden_compra_id BIGINT NOT NULL,
    animal_id BIGINT,
    categoria_animal_id BIGINT NOT NULL,
    cantidad INTEGER NOT NULL,
    peso NUMERIC(8,2) NOT NULL,
    precio NUMERIC(8,2) NOT NULL,
    edad INTEGER,
    descuento NUMERIC(8,2) NOT NULL DEFAULT 0,
    subtotal NUMERIC(8,2) NOT NULL,
    CONSTRAINT fk_detalle_orden_compra
        FOREIGN KEY (orden_compra_id)
        REFERENCES orden_compras(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_detalle_orden_animal
        FOREIGN KEY (animal_id)
        REFERENCES animals(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_detalle_orden_categoria
        FOREIGN KEY (categoria_animal_id)
        REFERENCES categoria_animales(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS cuarentenas (
    id BIGSERIAL PRIMARY KEY,
    proveedor_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    cod_compra VARCHAR(20) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    estado VARCHAR(50) NOT NULL,
    descuento NUMERIC(8,2) NOT NULL DEFAULT 0,
    total_peso NUMERIC(8,2),
    monto_total NUMERIC(8,2),
    CONSTRAINT fk_cuarentenas_proveedor
        FOREIGN KEY (proveedor_id)
        REFERENCES personas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_cuarentenas_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS cuarentena_detalle (
    id BIGSERIAL PRIMARY KEY,
    cuarentena_id BIGINT NOT NULL,
    animal_id BIGINT,
    categoria_animal_id BIGINT NOT NULL,
    cantidad INTEGER NOT NULL,
    peso NUMERIC(8,2) NOT NULL,
    precio NUMERIC(8,2) NOT NULL,
    edad INTEGER,
    descuento NUMERIC(8,2) NOT NULL DEFAULT 0,
    estado VARCHAR(50) NOT NULL,
    subtotal NUMERIC(8,2) NOT NULL,
    CONSTRAINT fk_cuarentena_detalle_cuarentena
        FOREIGN KEY (cuarentena_id)
        REFERENCES cuarentenas(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_cuarentena_detalle_animal
        FOREIGN KEY (animal_id)
        REFERENCES animals(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_cuarentena_detalle_categoria
        FOREIGN KEY (categoria_animal_id)
        REFERENCES categoria_animales(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS ingresos (
    id BIGSERIAL PRIMARY KEY,
    proveedor_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    cuarentena_id BIGINT,
    lote_id BIGINT NOT NULL,
    fecha_ingreso DATE NOT NULL,
    estado VARCHAR(50) NOT NULL,
    observaciones TEXT,
    descuento NUMERIC(8,2) NOT NULL DEFAULT 0,
    total_peso NUMERIC(8,2),
    monto_total NUMERIC(8,2),
    CONSTRAINT fk_ingresos_proveedor
        FOREIGN KEY (proveedor_id)
        REFERENCES personas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_ingresos_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_ingresos_cuarentena
        FOREIGN KEY (cuarentena_id)
        REFERENCES cuarentenas(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_ingresos_lote
        FOREIGN KEY (lote_id)
        REFERENCES lotes(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS detalle_ingresos (
    id BIGSERIAL PRIMARY KEY,
    ingreso_id BIGINT NOT NULL,
    animal_id BIGINT NOT NULL,
    observaciones TEXT,
    peso_oc NUMERIC(8,2) NOT NULL,
    peso_ingreso NUMERIC(8,2) NOT NULL,
    precio_compra NUMERIC(8,2) NOT NULL,
    CONSTRAINT fk_detalle_ingresos_ingreso
        FOREIGN KEY (ingreso_id)
        REFERENCES ingresos(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_detalle_ingresos_animal
        FOREIGN KEY (animal_id)
        REFERENCES animals(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- SPATIE PERMISSION / RELACIONES POLIMÓRFICAS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS model_has_permissions (
    permission_id BIGINT NOT NULL,
    model_type VARCHAR(255) NOT NULL,
    model_id BIGINT NOT NULL,
    PRIMARY KEY (permission_id, model_id, model_type),
    CONSTRAINT fk_model_has_permissions_permission
        FOREIGN KEY (permission_id)
        REFERENCES permisos(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS model_has_roles (
    role_id BIGINT NOT NULL,
    model_type VARCHAR(255) NOT NULL,
    model_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, model_id, model_type),
    CONSTRAINT fk_model_has_roles_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS role_has_permissions (
    permission_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (permission_id, role_id),
    CONSTRAINT fk_role_has_permissions_permission
        FOREIGN KEY (permission_id)
        REFERENCES permisos(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_role_has_permissions_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- ÍNDICES
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_animals_raza_id ON animals(raza_id);
CREATE INDEX IF NOT EXISTS idx_animals_categoria_id ON animals(categoria_id);
CREATE INDEX IF NOT EXISTS idx_animals_estado_productivo_id ON animals(estado_productivo_id);
CREATE INDEX IF NOT EXISTS idx_animals_lote_id ON animals(lote_id);
CREATE INDEX IF NOT EXISTS idx_animals_madre_id ON animals(madre_id);
CREATE INDEX IF NOT EXISTS idx_animals_padre_id ON animals(padre_id);
CREATE INDEX IF NOT EXISTS idx_animals_user_id ON animals(user_id);

CREATE INDEX IF NOT EXISTS idx_pesajes_animal_id ON pesajes(animal_id);
CREATE INDEX IF NOT EXISTS idx_eventos_sanitarios_animal_id ON eventos_sanitarios(animal_id);
CREATE INDEX IF NOT EXISTS idx_animal_eventos_animal_id ON animal_eventos(animal_id);

CREATE INDEX IF NOT EXISTS idx_servicios_hembra_id ON servicios_reproductivos(hembra_id);
CREATE INDEX IF NOT EXISTS idx_servicios_macho_id ON servicios_reproductivos(macho_id);
CREATE INDEX IF NOT EXISTS idx_gestaciones_servicio_id ON gestaciones(servicio_id);
CREATE INDEX IF NOT EXISTS idx_partos_gestacion_id ON partos(gestacion_id);
CREATE INDEX IF NOT EXISTS idx_nacimientos_parto_id ON nacimientos(parto_id);
CREATE INDEX IF NOT EXISTS idx_nacimientos_animal_id ON nacimientos(animal_id);

CREATE INDEX IF NOT EXISTS idx_orden_compras_proveedor_id ON orden_compras(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_detalle_orden_compra_id ON detalle_orden_compra(orden_compra_id);
CREATE INDEX IF NOT EXISTS idx_cuarentenas_proveedor_id ON cuarentenas(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_cuarentena_detalle_cuarentena_id ON cuarentena_detalle(cuarentena_id);
CREATE INDEX IF NOT EXISTS idx_ingresos_proveedor_id ON ingresos(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_ingresos_cuarentena_id ON ingresos(cuarentena_id);
CREATE INDEX IF NOT EXISTS idx_ingresos_lote_id ON ingresos(lote_id);
CREATE INDEX IF NOT EXISTS idx_detalle_ingresos_ingreso_id ON detalle_ingresos(ingreso_id);
CREATE INDEX IF NOT EXISTS idx_detalle_ingresos_animal_id ON detalle_ingresos(animal_id);

COMMIT;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================