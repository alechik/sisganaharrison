export const SOCIO_ROUTES = {
  clientes: "/socios-de-negocio/clientes",
  clientesCreate: "/socios-de-negocio/clientes/crear",
  proveedores: "/socios-de-negocio/proveedores",
  proveedoresCreate: "/socios-de-negocio/proveedores/crear",
  deleted: "/socios-de-negocio/eliminados",
  detail: (id: number | string) => `/socios-de-negocio/${id}`,
  edit: (id: number | string) => `/socios-de-negocio/${id}/editar`,
  tipos: "/socios-de-negocio/tipos",
  tiposCreate: "/socios-de-negocio/tipos/crear",
  tiposEdit: (id: number | string) => `/socios-de-negocio/tipos/${id}/editar`,
} as const;

export const SOCIO_DEFAULT_PAGE_SIZE = 10;

export const SOCIO_SORT_OPTIONS = [
  { value: "razon_social", label: "Razón social" },
  { value: "email", label: "Correo" },
  { value: "fecha_reg", label: "Fecha de registro" },
  { value: "created_at", label: "Fecha de creación" },
] as const;

export const TIPO_PERSONA_SORT_OPTIONS = [
  { value: "nombre", label: "Nombre" },
  { value: "created_at", label: "Fecha de creación" },
] as const;

export const TIPO_CLIENTE = "CLIENTE";
export const TIPO_PROVEEDOR = "PROVEEDOR";

export const SEXO_OPTIONS = [
  { value: "M", label: "Masculino" },
  { value: "H", label: "Femenino" },
] as const;

export const ESTADO_CIVIL_OPTIONS = [
  { value: "SOLTERO", label: "Soltero/a" },
  { value: "CASADO", label: "Casado/a" },
  { value: "UNION_LIBRE", label: "Unión libre" },
  { value: "DIVORCIADO", label: "Divorciado/a" },
  { value: "VIUDO", label: "Viudo/a" },
] as const;
