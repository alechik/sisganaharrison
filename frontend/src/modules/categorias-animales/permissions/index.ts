export const CATEGORIAS_ANIMALES_PERMISSIONS = {
  view: "categorias_animales.view",
  create: "categorias_animales.create",
  update: "categorias_animales.update",
  delete: "categorias_animales.delete",
  restore: "categorias_animales.restore",
  activate: "categorias_animales.activate",
} as const;

export type CategoriaAnimalPermission =
  (typeof CATEGORIAS_ANIMALES_PERMISSIONS)[keyof typeof CATEGORIAS_ANIMALES_PERMISSIONS];
