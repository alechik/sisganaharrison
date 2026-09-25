import Badge from "@/components/ui/badge/Badge";
import { getEstadoLabel } from "../utils";

interface Props {
  estado?: string | null;
}

export default function VentaStatusBadge({ estado }: Props) {
  const color =
    estado === "AUTORIZADA" ? "success" : estado === "ANULADA" ? "error" : "warning";

  return (
    <Badge size="sm" color={color}>
      {getEstadoLabel(estado)}
    </Badge>
  );
}
