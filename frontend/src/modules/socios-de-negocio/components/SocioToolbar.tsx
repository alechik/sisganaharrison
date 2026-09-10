import { Link } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import { SOCIO_ROUTES } from "../constants";
import { SOCIOS_PERMISSIONS, TIPOS_PERSONA_PERMISSIONS } from "../permissions";

export default function SocioToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PermissionGate permission={TIPOS_PERSONA_PERMISSIONS.update}>
        <Link
          to={SOCIO_ROUTES.tipos}
          className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.05]"
        >
          Tipos de persona
        </Link>
      </PermissionGate>

      <PermissionGate permission={SOCIOS_PERMISSIONS.restore}>
        <Link
          to={SOCIO_ROUTES.deleted}
          className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.05]"
        >
          Ver desactivados
        </Link>
      </PermissionGate>

      <PermissionGate permission={SOCIOS_PERMISSIONS.create}>
        <Link
          to={SOCIO_ROUTES.create}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          + Nuevo socio
        </Link>
      </PermissionGate>
    </div>
  );
}
