import { Link } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import { SERVICIO_REPRODUCTIVO_ROUTES, TIPO_INSEMINACION_ARTIFICIAL } from "../constants";
import { SERVICIOS_REPRODUCTIVOS_PERMISSIONS } from "../permissions";

interface Props {
  tipoServicio?: string;
}

export default function ServicioReproductivoToolbar({ tipoServicio }: Props) {
  const createPath = tipoServicio
    ? SERVICIO_REPRODUCTIVO_ROUTES.createByTipo(tipoServicio)
    : SERVICIO_REPRODUCTIVO_ROUTES.create;
  const label =
    tipoServicio === TIPO_INSEMINACION_ARTIFICIAL
      ? "+ Nueva inseminación"
      : tipoServicio
        ? "+ Nueva monta natural"
        : "+ Nuevo Servicio";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <PermissionGate permission={SERVICIOS_REPRODUCTIVOS_PERMISSIONS.create}>
        <Link
          to={createPath}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          {label}
        </Link>
      </PermissionGate>
    </div>
  );
}
