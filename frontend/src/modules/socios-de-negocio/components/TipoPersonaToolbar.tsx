import { Link } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import { SOCIO_ROUTES } from "../constants";
import { TIPOS_PERSONA_PERMISSIONS } from "../permissions";

export default function TipoPersonaToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        to={SOCIO_ROUTES.list}
        className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.05]"
      >
        Volver a socios
      </Link>
      <PermissionGate permission={TIPOS_PERSONA_PERMISSIONS.create}>
        <Link
          to={SOCIO_ROUTES.tiposCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          + Nuevo tipo
        </Link>
      </PermissionGate>
    </div>
  );
}
