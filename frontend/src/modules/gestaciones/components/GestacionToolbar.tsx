import { Link } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import { GESTACION_ROUTES } from "../constants";
import { GESTACIONES_PERMISSIONS } from "../permissions";

export default function GestacionToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PermissionGate permission={GESTACIONES_PERMISSIONS.create}>
        <Link
          to={GESTACION_ROUTES.create}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          + Nueva Gestación
        </Link>
      </PermissionGate>
    </div>
  );
}
