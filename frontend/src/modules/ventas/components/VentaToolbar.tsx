import { Link } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import { VENTA_ROUTES } from "../constants";
import { VENTAS_PERMISSIONS } from "../permissions";

export default function VentaToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PermissionGate permission={VENTAS_PERMISSIONS.create}>
        <Link
          to={VENTA_ROUTES.create}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          + Nueva venta
        </Link>
      </PermissionGate>
    </div>
  );
}
