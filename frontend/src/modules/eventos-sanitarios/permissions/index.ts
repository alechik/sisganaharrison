export const EVENTOS_SANITARIOS_PERMISSIONS = {
  view: "sanitario.view",
  create: "sanitario.create",
} as const;

export type EventosSanitariosPermission =
  (typeof EVENTOS_SANITARIOS_PERMISSIONS)[keyof typeof EVENTOS_SANITARIOS_PERMISSIONS];
