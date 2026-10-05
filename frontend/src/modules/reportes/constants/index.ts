export const REPORTE_ROUTES = {
  list: "/reportes",
} as const;

export const REPORTE_TIPOS = [
  { value: "inventario", label: "Inventario del hato" },
  { value: "sanidad", label: "Sanidad" },
  { value: "reproduccion", label: "Reproducción" },
  { value: "movimientos", label: "Movimientos, entradas y salidas" },
  { value: "productividad", label: "Productividad" },
] as const;

export type ReporteTipo = (typeof REPORTE_TIPOS)[number]["value"];

export const SEXO_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "H", label: "Hembras" },
  { value: "M", label: "Machos" },
];

export const ESTADO_ANIMAL_OPTIONS = [
  { value: "all", label: "Hato actual" },
  { value: "ACTIVO", label: "Activo" },
  { value: "INGRESO POR COMPRA", label: "Ingreso por compra" },
  { value: "RESERVADO", label: "Reservado" },
  { value: "ENFERMO", label: "Enfermo" },
  { value: "DESTETADO", label: "Destetado" },
  { value: "MUERTO", label: "Muerto" },
  { value: "VENDIDO", label: "Vendido" },
  { value: "OTRO", label: "Otro" },
];
