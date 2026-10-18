import Badge from "@/components/ui/badge/Badge";
import { getEstadoLabel } from "../utils";

interface Props {
  estado?: string | null;
}

export default function OrdenProductoStatusBadge({ estado }: Props) {
  const color =
    estado === "AUTORIZADO" ? "success" : estado === "CANCELADO" ? "error" : "warning";

  return (
    <Badge size="sm" color={color}>
      {getEstadoLabel(estado)}
    </Badge>
  );
}
