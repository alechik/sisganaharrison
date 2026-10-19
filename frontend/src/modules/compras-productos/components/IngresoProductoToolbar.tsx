import { Link } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import { INGRESO_PRODUCTO_ROUTES } from "../constants";
import { COMPRAS_PRODUCTOS_PERMISSIONS } from "../permissions";

export default function IngresoProductoToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PermissionGate permission={COMPRAS_PRODUCTOS_PERMISSIONS.create}>
        <Link
          to={INGRESO_PRODUCTO_ROUTES.create}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          + Nuevo ingreso
        </Link>
      </PermissionGate>
    </div>
  );
}
