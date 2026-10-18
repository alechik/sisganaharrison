-- =====================================================================
-- SCRIPT SQL - SISTEMA DE GESTIÓN GANADERA (v5)
-- Generado a partir de: Diagrama_de_Clases_V5.pdf
-- Motor: MySQL 8.x / MariaDB 10.x (InnoDB, utf8mb4)
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================================
-- LIMPIEZA (orden indiferente por FOREIGN_KEY_CHECKS = 0)
-- =====================================================================
DROP TABLE IF EXISTS `detalle_ingreso_producto`;
DROP TABLE IF EXISTS `ingreso_producto`;
DROP TABLE IF EXISTS `almacen_producto`;
DROP TABLE IF EXISTS `almacenes`;
DROP TABLE IF EXISTS `producto_servicio`;
DROP TABLE IF EXISTS `detalle_orden_compra_productos`;
DROP TABLE IF EXISTS `orden_compras_productos`;
DROP TABLE IF EXISTS `detalle_evento`;
DROP TABLE IF EXISTS `eventos_sanitarios`;
DROP TABLE IF EXISTS `detalle_traspaso`;
DROP TABLE IF EXISTS `traspaso`;
DROP TABLE IF EXISTS `detalle_salida`;
DROP TABLE IF EXISTS `salida`;
DROP TABLE IF EXISTS `detalle_venta`;
DROP TABLE IF EXISTS `venta`;
DROP TABLE IF EXISTS `detalle_ingresos`;
DROP TABLE IF EXISTS `ingresos`;
DROP TABLE IF EXISTS `cuarentena_detalle`;
DROP TABLE IF EXISTS `cuarentenas`;
DROP TABLE IF EXISTS `detalle_orden_compra`;
DROP TABLE IF EXISTS `orden_compras`;
DROP TABLE IF EXISTS `nacimientos`;
DROP TABLE IF EXISTS `partos`;
DROP TABLE IF EXISTS `gestaciones`;
DROP TABLE IF EXISTS `servicios_reproductivos`;
DROP TABLE IF EXISTS `animal_eventos`;
DROP TABLE IF EXISTS `detalle_pesaje`;
DROP TABLE IF EXISTS `pesajes`;
DROP TABLE IF EXISTS `animals`;
DROP TABLE IF EXISTS `grupo`;
DROP TABLE IF EXISTS `lotes`;
DROP TABLE IF EXISTS `potreros`;
DROP TABLE IF EXISTS `establecimientos`;
DROP TABLE IF EXISTS `personas_tipo`;
DROP TABLE IF EXISTS `tipo`;
DROP TABLE IF EXISTS `personas`;
DROP TABLE IF EXISTS `productos`;
DROP TABLE IF EXISTS `subcategoria`;
DROP TABLE IF EXISTS `categoria`;
DROP TABLE IF EXISTS `presentacion`;
DROP TABLE IF EXISTS `tipos_salidas`;
DROP TABLE IF EXISTS `tipos_eventos_sanitarios`;
DROP TABLE IF EXISTS `estados_productivos`;
DROP TABLE IF EXISTS `categoria_animales`;
DROP TABLE IF EXISTS `razas`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `role_has_permissions`;
DROP TABLE IF EXISTS `model_has_roles`;
DROP TABLE IF EXISTS `model_has_permissions`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `permisions`;

-- =====================================================================
-- MÓDULO: PERMISOS Y ROLES (estilo Spatie/Laravel)
-- =====================================================================

CREATE TABLE `permisions` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(255) NOT NULL,
  `guard_name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permisions_name_guard_unique` (`name`, `guard_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `roles` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(255) NOT NULL,
  `guard_name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_guard_unique` (`name`, `guard_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `model_has_permissions` (
  `permission_id` BIGINT UNSIGNED NOT NULL,
  `model_type`    VARCHAR(255) NOT NULL,
  `model_id`      BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`permission_id`, `model_id`, `model_type`),
  KEY `model_has_permissions_model_idx` (`model_id`, `model_type`),
  CONSTRAINT `mhp_permission_fk` FOREIGN KEY (`permission_id`) REFERENCES `permisions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `model_has_roles` (
  `role_id`    BIGINT UNSIGNED NOT NULL,
  `model_type` VARCHAR(255) NOT NULL,
  `model_id`   BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`role_id`, `model_id`, `model_type`),
  KEY `model_has_roles_model_idx` (`model_id`, `model_type`),
  CONSTRAINT `mhr_role_fk` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `role_has_permissions` (
  `permission_id` BIGINT UNSIGNED NOT NULL,
  `role_id`       BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`permission_id`, `role_id`),
  CONSTRAINT `rhp_permission_fk` FOREIGN KEY (`permission_id`) REFERENCES `permisions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rhp_role_fk` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- USUARIOS
-- =====================================================================

CREATE TABLE `users` (
  `id`        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(255) NOT NULL,
  `email`     VARCHAR(255) NOT NULL,
  `password`  VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- CATÁLOGOS BASE
-- =====================================================================

CREATE TABLE `razas` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre`      VARCHAR(100) NOT NULL,
  `codigo`      VARCHAR(20) NOT NULL,
  `descripcion` TEXT NULL,
  `estado`      BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `razas_codigo_unique` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `categoria_animales` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `codigo`      VARCHAR(20) NOT NULL,
  `nombre`      VARCHAR(100) NOT NULL,
  `descripcion` TEXT NULL,
  `activo`      BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categoria_animales_codigo_unique` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `estados_productivos` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `codigo`      VARCHAR(20) NOT NULL,
  `nombre`      VARCHAR(100) NOT NULL,
  `descripcion` TEXT NULL,
  `activo`      BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `estados_productivos_codigo_unique` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tipos_eventos_sanitarios` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `codigo`      VARCHAR(20) NOT NULL,
  `nombre`      VARCHAR(100) NOT NULL,
  `descripcion` TEXT NULL,
  `activo`      BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tipos_eventos_sanitarios_codigo_unique` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tipos_salidas` (
  `id`     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tipo` (
  `id`     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `presentacion` (
  `id`     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `categoria` (
  `id`     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `subcategoria` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre`       VARCHAR(50) NOT NULL,
  `categoria_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `subcategoria_categoria_idx` (`categoria_id`),
  CONSTRAINT `subcategoria_categoria_fk` FOREIGN KEY (`categoria_id`) REFERENCES `categoria` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Reemplaza a "medicamentos": catálogo general de productos (medicamentos, insumos, etc.)
CREATE TABLE `productos` (
  `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `sub_categoria_id`  BIGINT UNSIGNED NOT NULL,
  `presentacion_id`   BIGINT UNSIGNED NOT NULL,
  `codigo`            VARCHAR(20) NOT NULL,
  `nombre`            VARCHAR(100) NOT NULL,
  `nombre_cientifico` VARCHAR(120) NULL,
  `precio`            DECIMAL(8,2) NOT NULL,
  `descripcion`       TEXT NOT NULL,
  `activo`            BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `productos_codigo_unique` (`codigo`),
  KEY `productos_subcategoria_idx` (`sub_categoria_id`),
  KEY `productos_presentacion_idx` (`presentacion_id`),
  CONSTRAINT `productos_subcategoria_fk` FOREIGN KEY (`sub_categoria_id`) REFERENCES `subcategoria` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `productos_presentacion_fk` FOREIGN KEY (`presentacion_id`) REFERENCES `presentacion` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- ESTABLECIMIENTOS, POTREROS, LOTES Y GRUPOS
-- =====================================================================

CREATE TABLE `establecimientos` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `codigo`        VARCHAR(20) NOT NULL,
  `nombre`        VARCHAR(150) NOT NULL,
  `propietario`   VARCHAR(150) NULL,
  `telefono`      VARCHAR(30) NULL,
  `direccion`     VARCHAR(255) NULL,
  `municipio`     VARCHAR(100) NULL,
  `departamento`  VARCHAR(100) NULL,
  `pais`          VARCHAR(100) NULL,
  `area_total`    DECIMAL(10,2) NULL,
  `descripcion`   TEXT NULL,
  `activo`        BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `establecimientos_codigo_unique` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `potreros` (
  `id`                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `establecimiento_id` BIGINT UNSIGNED NOT NULL,
  `codigo`             VARCHAR(20) NOT NULL,
  `nombre`             VARCHAR(150) NOT NULL,
  `area_ha`            DECIMAL(10,2) NULL,
  `tipo_pasto`         VARCHAR(100) NULL,
  `disponibilidad`     BOOLEAN NOT NULL DEFAULT TRUE,
  `descripcion`        TEXT NULL,
  `activo`             BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`),
  KEY `potreros_establecimiento_idx` (`establecimiento_id`),
  CONSTRAINT `potreros_establecimiento_fk` FOREIGN KEY (`establecimiento_id`) REFERENCES `establecimientos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `lotes` (
  `id`                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `potrero_id`         BIGINT UNSIGNED NOT NULL,
  `codigo`             VARCHAR(20) NOT NULL,
  `nombre`             VARCHAR(100) NOT NULL,
  `capacidad_animales` INT NOT NULL DEFAULT 0,
  `area_ha`            DECIMAL(10,2) NULL,
  `observaciones`      TEXT NULL,
  `activo`             BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`),
  KEY `lotes_potrero_idx` (`potrero_id`),
  CONSTRAINT `lotes_potrero_fk` FOREIGN KEY (`potrero_id`) REFERENCES `potreros` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `grupo` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre`        VARCHAR(100) NOT NULL,
  `lote_id`       BIGINT UNSIGNED NOT NULL,
  `observaciones` TEXT NULL,
  `activo`        BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`),
  KEY `grupo_lote_idx` (`lote_id`),
  CONSTRAINT `grupo_lote_fk` FOREIGN KEY (`lote_id`) REFERENCES `lotes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- PERSONAS (proveedores / clientes / responsables)
-- =====================================================================

CREATE TABLE `personas` (
  `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `razon_social`     VARCHAR(255) NOT NULL,
  `responsable`      VARCHAR(255) NULL,
  `email`            VARCHAR(255) NULL,
  `fecha_nacimiento` DATE NULL,
  `ci`               INT NULL,
  `nit`              VARCHAR(30) NULL,
  `celular`          INT NULL,
  `estado_civil`     VARCHAR(30) NULL,
  `sexo`             VARCHAR(30) NULL,
  `direccion`        VARCHAR(100) NULL,
  `estado`           VARCHAR(25) NOT NULL,
  `fecha_reg`        DATE NOT NULL,
  `user_id`          BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personas_email_unique` (`email`),
  KEY `personas_user_idx` (`user_id`),
  CONSTRAINT `personas_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `personas_tipo` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `persona_id` BIGINT UNSIGNED NOT NULL,
  `rol_id`     BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `personas_tipo_persona_idx` (`persona_id`),
  KEY `personas_tipo_rol_idx` (`rol_id`),
  CONSTRAINT `personas_tipo_persona_fk` FOREIGN KEY (`persona_id`) REFERENCES `personas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `personas_tipo_rol_fk` FOREIGN KEY (`rol_id`) REFERENCES `tipo` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- ANIMALES
-- =====================================================================

CREATE TABLE `animals` (
  `id`                   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `codigo`               VARCHAR(30) NULL,
  `arete`                VARCHAR(30) NULL,
  `nombre`               VARCHAR(100) NULL,
  `sexo`                 ENUM('M','H') NOT NULL,
  `fecha_nacimiento`     DATE NULL,
  `color`                VARCHAR(60) NULL,
  `raza_id`              BIGINT UNSIGNED NOT NULL,
  `categoria_id`         BIGINT UNSIGNED NOT NULL,
  `estado_productivo_id` BIGINT UNSIGNED NULL,
  `lote_id`              BIGINT UNSIGNED NULL,
  `madre_id`             BIGINT UNSIGNED NULL,
  `padre_id`             BIGINT UNSIGNED NULL,
  `user_id`              BIGINT UNSIGNED NOT NULL,
  `edad_ingreso`         INT NULL,
  `edad_actual`          INT NOT NULL,
  `precio_kilo`          DECIMAL(8,2) NOT NULL,
  `estado`               VARCHAR(20) NOT NULL,
  `grupo_id`             BIGINT UNSIGNED NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `animals_codigo_unique` (`codigo`),
  UNIQUE KEY `animals_arete_unique` (`arete`),
  KEY `animals_raza_idx` (`raza_id`),
  KEY `animals_categoria_idx` (`categoria_id`),
  KEY `animals_estado_productivo_idx` (`estado_productivo_id`),
  KEY `animals_lote_idx` (`lote_id`),
  KEY `animals_madre_idx` (`madre_id`),
  KEY `animals_padre_idx` (`padre_id`),
  KEY `animals_user_idx` (`user_id`),
  KEY `animals_grupo_idx` (`grupo_id`),
  CONSTRAINT `animals_raza_fk` FOREIGN KEY (`raza_id`) REFERENCES `razas` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `animals_categoria_fk` FOREIGN KEY (`categoria_id`) REFERENCES `categoria_animales` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `animals_estado_productivo_fk` FOREIGN KEY (`estado_productivo_id`) REFERENCES `estados_productivos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `animals_lote_fk` FOREIGN KEY (`lote_id`) REFERENCES `lotes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `animals_madre_fk` FOREIGN KEY (`madre_id`) REFERENCES `animals` (`id`) ON DELETE SET NULL,
  CONSTRAINT `animals_padre_fk` FOREIGN KEY (`padre_id`) REFERENCES `animals` (`id`) ON DELETE SET NULL,
  CONSTRAINT `animals_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `animals_grupo_fk` FOREIGN KEY (`grupo_id`) REFERENCES `grupo` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `animal_eventos` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `animal_id`   BIGINT UNSIGNED NOT NULL,
  `tipo`        VARCHAR(50) NOT NULL,
  `fecha`       DATE NOT NULL,
  `descripcion` TEXT NULL,
  `metadata`    JSON NULL,
  PRIMARY KEY (`id`),
  KEY `animal_eventos_animal_idx` (`animal_id`),
  CONSTRAINT `animal_eventos_animal_fk` FOREIGN KEY (`animal_id`) REFERENCES `animals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- PESAJES (cabecera + detalle por animal)
-- =====================================================================

CREATE TABLE `pesajes` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `codigo_pesaje` VARCHAR(10) NOT NULL,
  `fecha_pesaje`  DATE NOT NULL,
  `total_peso`    DECIMAL(8,2) NOT NULL,
  `observacion`   TEXT NULL,
  `user_id`       BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pesajes_codigo_unique` (`codigo_pesaje`),
  KEY `pesajes_user_idx` (`user_id`),
  CONSTRAINT `pesajes_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `detalle_pesaje` (
  `id`        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `pesaje_id` BIGINT UNSIGNED NOT NULL,
  `animal_id` BIGINT UNSIGNED NOT NULL,
  `lote_id`   BIGINT UNSIGNED NOT NULL,
  `peso`      DECIMAL(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `detalle_pesaje_pesaje_idx` (`pesaje_id`),
  KEY `detalle_pesaje_animal_idx` (`animal_id`),
  KEY `detalle_pesaje_lote_idx` (`lote_id`),
  CONSTRAINT `detalle_pesaje_pesaje_fk` FOREIGN KEY (`pesaje_id`) REFERENCES `pesajes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `detalle_pesaje_animal_fk` FOREIGN KEY (`animal_id`) REFERENCES `animals` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `detalle_pesaje_lote_fk` FOREIGN KEY (`lote_id`) REFERENCES `lotes` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- SANIDAD (cabecera de evento + detalle por animal y producto)
-- =====================================================================

CREATE TABLE `eventos_sanitarios` (
  `id`                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tipo_evento_id`          BIGINT UNSIGNED NOT NULL,
  `user_id`                 BIGINT UNSIGNED NOT NULL,
  `codigo_evento_sanitario` VARCHAR(20) NOT NULL,
  `fecha`                   DATE NOT NULL,
  `diagnostico`             TEXT NULL,
  `tratamiento`             TEXT NULL,
  `total`                   DECIMAL(10,2) NOT NULL,
  `observaciones`           TEXT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `eventos_sanitarios_codigo_unique` (`codigo_evento_sanitario`),
  KEY `eventos_sanitarios_tipo_idx` (`tipo_evento_id`),
  KEY `eventos_sanitarios_user_idx` (`user_id`),
  CONSTRAINT `eventos_sanitarios_tipo_fk` FOREIGN KEY (`tipo_evento_id`) REFERENCES `tipos_eventos_sanitarios` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `eventos_sanitarios_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `detalle_evento` (
  `id`                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `evento_sanitario_id` BIGINT UNSIGNED NOT NULL,
  `animal_id`           BIGINT UNSIGNED NOT NULL,
  `lote_id`             BIGINT UNSIGNED NOT NULL,
  `producto_id`         BIGINT UNSIGNED NOT NULL,
  `peso_animal`         DECIMAL(8,2) NOT NULL,
  `precio_medicamento`  DECIMAL(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `detalle_evento_evento_idx` (`evento_sanitario_id`),
  KEY `detalle_evento_animal_idx` (`animal_id`),
  KEY `detalle_evento_lote_idx` (`lote_id`),
  KEY `detalle_evento_producto_idx` (`producto_id`),
  CONSTRAINT `detalle_evento_evento_fk` FOREIGN KEY (`evento_sanitario_id`) REFERENCES `eventos_sanitarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `detalle_evento_animal_fk` FOREIGN KEY (`animal_id`) REFERENCES `animals` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `detalle_evento_lote_fk` FOREIGN KEY (`lote_id`) REFERENCES `lotes` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `detalle_evento_producto_fk` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- REPRODUCCIÓN
-- =====================================================================

CREATE TABLE `servicios_reproductivos` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `hembra_id`       BIGINT UNSIGNED NOT NULL,
  `macho_id`        BIGINT UNSIGNED NULL,
  `user_id`         BIGINT UNSIGNED NOT NULL,
  `codigo_servicio` VARCHAR(20) NOT NULL,
  `fecha_servicio`  DATE NOT NULL,
  `tipo_servicio`   VARCHAR(30) NOT NULL,
  `resultado`       VARCHAR(30) NULL,
  `observaciones`   TEXT NULL,
  `total`           DECIMAL(10,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `servicios_reproductivos_codigo_unique` (`codigo_servicio`),
  KEY `servicios_reproductivos_hembra_idx` (`hembra_id`),
  KEY `servicios_reproductivos_macho_idx` (`macho_id`),
  KEY `servicios_reproductivos_user_idx` (`user_id`),
  CONSTRAINT `servicios_reproductivos_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `servicios_reproductivos_hembra_fk` FOREIGN KEY (`hembra_id`) REFERENCES `animals` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `servicios_reproductivos_macho_fk` FOREIGN KEY (`macho_id`) REFERENCES `animals` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `gestaciones` (
  `id`                   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `servicio_id`          BIGINT UNSIGNED NOT NULL,
  `fecha_confirmacion`   DATE NULL,
  `fecha_probable_parto` DATE NULL,
  `estado`               VARCHAR(30) NOT NULL,
  `observaciones`        TEXT NULL,
  PRIMARY KEY (`id`),
  KEY `gestaciones_servicio_idx` (`servicio_id`),
  CONSTRAINT `gestaciones_servicio_fk` FOREIGN KEY (`servicio_id`) REFERENCES `servicios_reproductivos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `partos` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `gestacion_id`  BIGINT UNSIGNED NOT NULL,
  `fecha_parto`   DATE NOT NULL,
  `observaciones` TEXT NULL,
  PRIMARY KEY (`id`),
  KEY `partos_gestacion_idx` (`gestacion_id`),
  CONSTRAINT `partos_gestacion_fk` FOREIGN KEY (`gestacion_id`) REFERENCES `gestaciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `nacimientos` (
  `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `parto_id`          BIGINT UNSIGNED NOT NULL,
  `animal_id`         BIGINT UNSIGNED NULL,
  `user_id`           BIGINT UNSIGNED NOT NULL,
  `arete`             VARCHAR(30) NULL,
  `sexo`              CHAR(1) NOT NULL,
  `peso_nacimiento`   DECIMAL(8,2) NULL,
  `estado_nacimiento` VARCHAR(10) NOT NULL,
  `causa_muerte`      VARCHAR(150) NULL,
  `observaciones`     TEXT NULL,
  PRIMARY KEY (`id`),
  KEY `nacimientos_parto_idx` (`parto_id`),
  KEY `nacimientos_animal_idx` (`animal_id`),
  KEY `nacimientos_user_idx` (`user_id`),
  CONSTRAINT `nacimientos_parto_fk` FOREIGN KEY (`parto_id`) REFERENCES `partos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `nacimientos_animal_fk` FOREIGN KEY (`animal_id`) REFERENCES `animals` (`id`) ON DELETE SET NULL,
  CONSTRAINT `nacimientos_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- COMPRAS DE GANADO Y CUARENTENA
-- =====================================================================

CREATE TABLE `orden_compras` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `proveedor_id` BIGINT UNSIGNED NOT NULL,
  `user_id`      BIGINT UNSIGNED NOT NULL,
  `cod_compra`   VARCHAR(20) NOT NULL,
  `fecha`        DATE NOT NULL,
  `estado`       VARCHAR(50) NOT NULL,
  `descuento`    DECIMAL(8,2) NOT NULL DEFAULT 0,
  `total_peso`   DECIMAL(8,2) NOT NULL,
  `monto_total`  DECIMAL(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orden_compras_cod_unique` (`cod_compra`),
  KEY `orden_compras_proveedor_idx` (`proveedor_id`),
  KEY `orden_compras_user_idx` (`user_id`),
  CONSTRAINT `orden_compras_proveedor_fk` FOREIGN KEY (`proveedor_id`) REFERENCES `personas` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `orden_compras_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `detalle_orden_compra` (
  `id`                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `orden_compra_id`     BIGINT UNSIGNED NOT NULL,
  `animal_id`           BIGINT UNSIGNED NULL,
  `categoria_animal_id` BIGINT UNSIGNED NOT NULL,
  `cantidad`            INT NOT NULL,
  `peso`                DECIMAL(8,2) NULL,
  `precio`              DECIMAL(8,2) NOT NULL,
  `edad`                INT NULL,
  `descuento`           DECIMAL(8,2) NOT NULL DEFAULT 0,
  `subtotal`            DECIMAL(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `detalle_orden_compra_orden_idx` (`orden_compra_id`),
  KEY `detalle_orden_compra_animal_idx` (`animal_id`),
  KEY `detalle_orden_compra_categoria_idx` (`categoria_animal_id`),
  CONSTRAINT `detalle_orden_compra_orden_fk` FOREIGN KEY (`orden_compra_id`) REFERENCES `orden_compras` (`id`) ON DELETE CASCADE,
  CONSTRAINT `detalle_orden_compra_animal_fk` FOREIGN KEY (`animal_id`) REFERENCES `animals` (`id`) ON DELETE SET NULL,
  CONSTRAINT `detalle_orden_compra_categoria_fk` FOREIGN KEY (`categoria_animal_id`) REFERENCES `categoria_animales` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `cuarentenas` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `proveedor_id` BIGINT UNSIGNED NOT NULL,
  `user_id`      BIGINT UNSIGNED NOT NULL,
  `cod_compra`   VARCHAR(20) NOT NULL,
  `fecha_inicio` DATE NOT NULL,
  `fecha_fin`    DATE NULL,
  `estado`       VARCHAR(50) NOT NULL,
  `descuento`    DECIMAL(8,2) NOT NULL DEFAULT 0,
  `total_peso`   DECIMAL(8,2) NOT NULL,
  `monto_total`  DECIMAL(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cuarentenas_proveedor_idx` (`proveedor_id`),
  KEY `cuarentenas_user_idx` (`user_id`),
  CONSTRAINT `cuarentenas_proveedor_fk` FOREIGN KEY (`proveedor_id`) REFERENCES `personas` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `cuarentenas_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `cuarentena_detalle` (
  `id`                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `cuarentena_id`       BIGINT UNSIGNED NOT NULL,
  `animal_id`           BIGINT UNSIGNED NULL,
  `categoria_animal_id` BIGINT UNSIGNED NOT NULL,
  `cantidad`            INT NOT NULL,
  `peso`                DECIMAL(8,2) NOT NULL,
  `precio`              DECIMAL(8,2) NOT NULL,
  `edad`                INT NOT NULL,
  `descuento`           DECIMAL(8,2) NOT NULL DEFAULT 0,
  `estado`              VARCHAR(50) NOT NULL,
  `subtotal`            DECIMAL(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cuarentena_detalle_cuarentena_idx` (`cuarentena_id`),
  KEY `cuarentena_detalle_animal_idx` (`animal_id`),
  KEY `cuarentena_detalle_categoria_idx` (`categoria_animal_id`),
  CONSTRAINT `cuarentena_detalle_cuarentena_fk` FOREIGN KEY (`cuarentena_id`) REFERENCES `cuarentenas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cuarentena_detalle_animal_fk` FOREIGN KEY (`animal_id`) REFERENCES `animals` (`id`) ON DELETE SET NULL,
  CONSTRAINT `cuarentena_detalle_categoria_fk` FOREIGN KEY (`categoria_animal_id`) REFERENCES `categoria_animales` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- INGRESOS (recepción de animales al establecimiento)
-- =====================================================================

CREATE TABLE `ingresos` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `proveedor_id`  BIGINT UNSIGNED NOT NULL,
  `user_id`       BIGINT UNSIGNED NOT NULL,
  `cuarentena_id` BIGINT UNSIGNED NULL,
  `lote_id`       BIGINT UNSIGNED NULL,
  `grupo_id`      BIGINT UNSIGNED NULL,
  `fecha_ingreso` DATE NOT NULL,
  `estado`        VARCHAR(50) NOT NULL,
  `observaciones` TEXT NULL,
  `descuento`     DECIMAL(8,2) NOT NULL DEFAULT 0,
  `total_peso`    DECIMAL(8,2) NOT NULL,
  `monto_total`   DECIMAL(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ingresos_proveedor_idx` (`proveedor_id`),
  KEY `ingresos_user_idx` (`user_id`),
  KEY `ingresos_cuarentena_idx` (`cuarentena_id`),
  KEY `ingresos_lote_idx` (`lote_id`),
  KEY `ingresos_grupo_idx` (`grupo_id`),
  CONSTRAINT `ingresos_proveedor_fk` FOREIGN KEY (`proveedor_id`) REFERENCES `personas` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `ingresos_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `ingresos_cuarentena_fk` FOREIGN KEY (`cuarentena_id`) REFERENCES `cuarentenas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `ingresos_lote_fk` FOREIGN KEY (`lote_id`) REFERENCES `lotes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `ingresos_grupo_fk` FOREIGN KEY (`grupo_id`) REFERENCES `grupo` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `detalle_ingresos` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ingreso_id`    BIGINT UNSIGNED NOT NULL,
  `animal_id`     BIGINT UNSIGNED NOT NULL,
  `observaciones` TEXT NULL,
  `peso_oc`       DECIMAL(8,2) NOT NULL,
  `peso_ingreso`  DECIMAL(8,2) NOT NULL,
  `precio_compra` DECIMAL(8,2) NOT NULL,
  `edad`          INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `detalle_ingresos_ingreso_idx` (`ingreso_id`),
  KEY `detalle_ingresos_animal_idx` (`animal_id`),
  CONSTRAINT `detalle_ingresos_ingreso_fk` FOREIGN KEY (`ingreso_id`) REFERENCES `ingresos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `detalle_ingresos_animal_fk` FOREIGN KEY (`animal_id`) REFERENCES `animals` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- VENTAS Y SALIDAS
-- =====================================================================

CREATE TABLE `venta` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `cliente_id`  BIGINT UNSIGNED NOT NULL,
  `user_id`     BIGINT UNSIGNED NOT NULL,
  `cod_venta`   VARCHAR(20) NOT NULL,
  `fecha_venta` DATE NOT NULL,
  `estado`      VARCHAR(50) NOT NULL,
  `descuento`   DECIMAL(8,2) NOT NULL DEFAULT 0,
  `total_peso`  DECIMAL(8,2) NOT NULL,
  `monto_total` DECIMAL(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `venta_cod_unique` (`cod_venta`),
  KEY `venta_cliente_idx` (`cliente_id`),
  KEY `venta_user_idx` (`user_id`),
  CONSTRAINT `venta_cliente_fk` FOREIGN KEY (`cliente_id`) REFERENCES `personas` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `venta_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `detalle_venta` (
  `id`        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `venta_id`  BIGINT UNSIGNED NOT NULL,
  `animal_id` BIGINT UNSIGNED NOT NULL,
  `cantidad`  INT NOT NULL,
  `peso`      DECIMAL(8,2) NOT NULL,
  `lote_id`   BIGINT UNSIGNED NOT NULL,
  `precio`    DECIMAL(8,2) NOT NULL,
  `descuento` DECIMAL(8,2) NOT NULL DEFAULT 0,
  `subtotal`  DECIMAL(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `detalle_venta_venta_idx` (`venta_id`),
  KEY `detalle_venta_animal_idx` (`animal_id`),
  KEY `detalle_venta_lote_idx` (`lote_id`),
  CONSTRAINT `detalle_venta_venta_fk` FOREIGN KEY (`venta_id`) REFERENCES `venta` (`id`) ON DELETE CASCADE,
  CONSTRAINT `detalle_venta_animal_fk` FOREIGN KEY (`animal_id`) REFERENCES `animals` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `detalle_venta_lote_fk` FOREIGN KEY (`lote_id`) REFERENCES `lotes` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `salida` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `cliente_id`     BIGINT UNSIGNED NOT NULL,
  `user_id`        BIGINT UNSIGNED NOT NULL,
  `venta_id`       BIGINT UNSIGNED NULL,
  `tipo_salida_id` BIGINT UNSIGNED NOT NULL,
  `fecha_salida`   DATE NOT NULL,
  `estado`         VARCHAR(50) NOT NULL,
  `descuento`      DECIMAL(8,2) NOT NULL DEFAULT 0,
  `total_peso`     DECIMAL(8,2) NOT NULL,
  `monto_total`    DECIMAL(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `salida_cliente_idx` (`cliente_id`),
  KEY `salida_user_idx` (`user_id`),
  KEY `salida_venta_idx` (`venta_id`),
  KEY `salida_tipo_idx` (`tipo_salida_id`),
  CONSTRAINT `salida_cliente_fk` FOREIGN KEY (`cliente_id`) REFERENCES `personas` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `salida_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `salida_venta_fk` FOREIGN KEY (`venta_id`) REFERENCES `venta` (`id`) ON DELETE SET NULL,
  CONSTRAINT `salida_tipo_fk` FOREIGN KEY (`tipo_salida_id`) REFERENCES `tipos_salidas` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `detalle_salida` (
  `id`        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `animal_id` BIGINT UNSIGNED NOT NULL,
  `salida_id` BIGINT UNSIGNED NOT NULL,
  `cantidad`  INT NOT NULL,
  `peso`      DECIMAL(8,2) NOT NULL,
  `lote_id`   BIGINT UNSIGNED NOT NULL,
  `grupo_id`  BIGINT UNSIGNED NULL,
  `precio`    DECIMAL(8,2) NOT NULL,
  `descuento` DECIMAL(8,2) NOT NULL DEFAULT 0,
  `subtotal`  DECIMAL(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `detalle_salida_animal_idx` (`animal_id`),
  KEY `detalle_salida_salida_idx` (`salida_id`),
  KEY `detalle_salida_lote_idx` (`lote_id`),
  KEY `detalle_salida_grupo_idx` (`grupo_id`),
  CONSTRAINT `detalle_salida_animal_fk` FOREIGN KEY (`animal_id`) REFERENCES `animals` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `detalle_salida_salida_fk` FOREIGN KEY (`salida_id`) REFERENCES `salida` (`id`) ON DELETE CASCADE,
  CONSTRAINT `detalle_salida_lote_fk` FOREIGN KEY (`lote_id`) REFERENCES `lotes` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `detalle_salida_grupo_fk` FOREIGN KEY (`grupo_id`) REFERENCES `grupo` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- TRASPASOS (movimiento de animales entre lotes)
-- =====================================================================

CREATE TABLE `traspaso` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`         BIGINT UNSIGNED NOT NULL,
  `lote_salida_id`  BIGINT UNSIGNED NOT NULL,
  `lote_ingreso_id` BIGINT UNSIGNED NOT NULL,
  `fecha_traspaso`  DATE NOT NULL,
  `observacion`     TEXT NULL,
  `total_peso`      DECIMAL(8,2) NOT NULL,
  `monto_total`     DECIMAL(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `traspaso_user_idx` (`user_id`),
  KEY `traspaso_lote_salida_idx` (`lote_salida_id`),
  KEY `traspaso_lote_ingreso_idx` (`lote_ingreso_id`),
  CONSTRAINT `traspaso_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `traspaso_lote_salida_fk` FOREIGN KEY (`lote_salida_id`) REFERENCES `lotes` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `traspaso_lote_ingreso_fk` FOREIGN KEY (`lote_ingreso_id`) REFERENCES `lotes` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `traspaso_lotes_distintos_chk` CHECK (`lote_salida_id` <> `lote_ingreso_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `detalle_traspaso` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `animal_id`   BIGINT UNSIGNED NOT NULL,
  `traspaso_id` BIGINT UNSIGNED NOT NULL,
  `cantidad`    INT NOT NULL,
  `peso`        DECIMAL(8,2) NOT NULL,
  `precio`      DECIMAL(8,2) NOT NULL,
  `subtotal`    DECIMAL(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `detalle_traspaso_animal_idx` (`animal_id`),
  KEY `detalle_traspaso_traspaso_idx` (`traspaso_id`),
  CONSTRAINT `detalle_traspaso_animal_fk` FOREIGN KEY (`animal_id`) REFERENCES `animals` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `detalle_traspaso_traspaso_fk` FOREIGN KEY (`traspaso_id`) REFERENCES `traspaso` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- COMPRAS DE PRODUCTOS (insumos / medicamentos)
-- =====================================================================

CREATE TABLE `orden_compras_productos` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `proveedor_id` BIGINT UNSIGNED NOT NULL,
  `user_id`      BIGINT UNSIGNED NOT NULL,
  `cod_compra`   VARCHAR(20) NOT NULL,
  `fecha`        DATE NOT NULL,
  `estado`       VARCHAR(50) NOT NULL,
  `descuento`    DECIMAL(8,2) NOT NULL DEFAULT 0,
  `monto_total`  DECIMAL(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orden_compras_productos_cod_unique` (`cod_compra`),
  KEY `ocp_proveedor_idx` (`proveedor_id`),
  KEY `ocp_user_idx` (`user_id`),
  CONSTRAINT `ocp_proveedor_fk` FOREIGN KEY (`proveedor_id`) REFERENCES `personas` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `ocp_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `detalle_orden_compra_productos` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `orden_compra_id` BIGINT UNSIGNED NOT NULL,
  `producto_id`     BIGINT UNSIGNED NOT NULL,
  `cantidad`        INT NOT NULL,
  `precio`          DECIMAL(8,2) NOT NULL,
  `descuento`       DECIMAL(8,2) NOT NULL DEFAULT 0,
  `subtotal`        DECIMAL(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `docp_orden_idx` (`orden_compra_id`),
  KEY `docp_producto_idx` (`producto_id`),
  CONSTRAINT `docp_orden_fk` FOREIGN KEY (`orden_compra_id`) REFERENCES `orden_compras_productos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `docp_producto_fk` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- ALMACENES E INVENTARIO DE PRODUCTOS
-- =====================================================================

CREATE TABLE `almacenes` (
  `id`                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `establecimiento_id` BIGINT UNSIGNED NOT NULL,
  `nombre`             VARCHAR(50) NOT NULL,
  `direccion`          VARCHAR(150) NOT NULL,
  `observacion`        TEXT NULL,
  `estado`             ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`id`),
  KEY `almacenes_establecimiento_idx` (`establecimiento_id`),
  CONSTRAINT `almacenes_establecimiento_fk` FOREIGN KEY (`establecimiento_id`) REFERENCES `establecimientos` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `almacen_producto` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `producto_id` BIGINT UNSIGNED NOT NULL,
  `almacen_id`  BIGINT UNSIGNED NOT NULL,
  `stock`       DECIMAL(8,2) NOT NULL DEFAULT 0,
  `estado`      ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`id`),
  UNIQUE KEY `almacen_producto_unique` (`almacen_id`, `producto_id`),
  KEY `almacen_producto_producto_idx` (`producto_id`),
  CONSTRAINT `almacen_producto_producto_fk` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `almacen_producto_almacen_fk` FOREIGN KEY (`almacen_id`) REFERENCES `almacenes` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ingreso_producto` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `proveedor_id` BIGINT UNSIGNED NOT NULL,
  `almacen_id`   BIGINT UNSIGNED NOT NULL,
  `user_id`      BIGINT UNSIGNED NOT NULL,
  `cod_ingreso`  VARCHAR(20) NOT NULL,
  `fecha`        DATE NOT NULL,
  `descuento`    DECIMAL(8,2) NOT NULL DEFAULT 0,
  `monto_total`  DECIMAL(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ingreso_producto_cod_unique` (`cod_ingreso`),
  KEY `ingreso_producto_proveedor_idx` (`proveedor_id`),
  KEY `ingreso_producto_almacen_idx` (`almacen_id`),
  KEY `ingreso_producto_user_idx` (`user_id`),
  CONSTRAINT `ingreso_producto_proveedor_fk` FOREIGN KEY (`proveedor_id`) REFERENCES `personas` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `ingreso_producto_almacen_fk` FOREIGN KEY (`almacen_id`) REFERENCES `almacenes` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `ingreso_producto_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `detalle_ingreso_producto` (
  `id`                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ingreso_producto_id` BIGINT UNSIGNED NOT NULL,
  `producto_id`         BIGINT UNSIGNED NOT NULL,
  `cantidad`            INT NOT NULL,
  `precio`              DECIMAL(8,2) NOT NULL,
  `descuento`           DECIMAL(8,2) NOT NULL DEFAULT 0,
  `subtotal`            DECIMAL(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `dip_ingreso_idx` (`ingreso_producto_id`),
  KEY `dip_producto_idx` (`producto_id`),
  CONSTRAINT `dip_ingreso_fk` FOREIGN KEY (`ingreso_producto_id`) REFERENCES `ingreso_producto` (`id`) ON DELETE CASCADE,
  CONSTRAINT `dip_producto_fk` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Productos usados en un servicio reproductivo (semen, hormonas, etc.).
-- Se asume que servicio_id referencia servicios_reproductivos (el diagrama no lo nombra).
CREATE TABLE `producto_servicio` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `producto_id` BIGINT UNSIGNED NOT NULL,
  `servicio_id` BIGINT UNSIGNED NOT NULL,
  `precio`      DECIMAL(8,2) NOT NULL,
  `cantidad`    INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `producto_servicio_producto_idx` (`producto_id`),
  KEY `producto_servicio_servicio_idx` (`servicio_id`),
  CONSTRAINT `producto_servicio_producto_fk` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `producto_servicio_servicio_fk` FOREIGN KEY (`servicio_id`) REFERENCES `servicios_reproductivos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- FIN DEL SCRIPT
-- =====================================================================
