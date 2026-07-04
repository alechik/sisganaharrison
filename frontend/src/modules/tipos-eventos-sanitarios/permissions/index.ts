export const TIPOS_EVENTOS_SANITARIOS_PERMISSIONS = {
  view: "tipos_eventos_sanitarios.view",
  create: "tipos_eventos_sanitarios.create",
  update: "tipos_eventos_sanitarios.update",
  delete: "tipos_eventos_sanitarios.delete",
  restore: "tipos_eventos_sanitarios.restore",
  activate: "tipos_eventos_sanitarios.activate",
} as const;

export type TipoEventoSanitarioPermission =
  (typeof TIPOS_EVENTOS_SANITARIOS_PERMISSIONS)[keyof typeof TIPOS_EVENTOS_SANITARIOS_PERMISSIONS];
