import { Link } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import { CUARENTENA_ROUTES } from "../constants";
import { COMPRAS_PERMISSIONS } from "../permissions";

export default function CuarentenaToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PermissionGate permission={COMPRAS_PERMISSIONS.create}>
        <Link
          to={CUARENTENA_ROUTES.create}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          + Cuarentena directa
        </Link>
      </PermissionGate>
    </div>
  );
}
