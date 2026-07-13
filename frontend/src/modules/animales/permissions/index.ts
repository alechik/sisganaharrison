export const ANIMALES_PERMISSIONS = {
  view: "animales.view",
  create: "animales.create",
  update: "animales.update",
  delete: "animales.delete",
  restore: "animales.restore",
  activate: "animales.activate",
  export: "animales.export",
} as const;

export type AnimalPermission =
  (typeof ANIMALES_PERMISSIONS)[keyof typeof ANIMALES_PERMISSIONS];
