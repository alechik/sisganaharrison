import { Link } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import { SERVICIO_REPRODUCTIVO_ROUTES } from "../constants";
import { SERVICIOS_REPRODUCTIVOS_PERMISSIONS } from "../permissions";

export default function ServicioReproductivoToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PermissionGate permission={SERVICIOS_REPRODUCTIVOS_PERMISSIONS.create}>
        <Link
          to={SERVICIO_REPRODUCTIVO_ROUTES.create}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          + Nuevo Servicio
        </Link>
      </PermissionGate>
    </div>
  );
}
