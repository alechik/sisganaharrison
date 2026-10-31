import { Link } from "react-router-dom";

import RoleGate from "@/components/auth/RoleGate";
import { INFORME_DIARIO_ROUTES } from "../constants";

export default function InformeToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <RoleGate roles={["trabajador"]}>
        <Link
          to={INFORME_DIARIO_ROUTES.create}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          + Nuevo informe
        </Link>
      </RoleGate>
    </div>
  );
}
