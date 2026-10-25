import Badge from "@/components/ui/badge/Badge";
import { getEstadoLabel } from "../utils";

interface Props {
  estado?: string | null;
}

export default function TareaStatusBadge({ estado }: Props) {
  const color =
    estado === "TERMINADO" ? "success" : estado === "PENDIENTE" ? "warning" : "info";

  return (
    <Badge size="sm" color={color}>
      {getEstadoLabel(estado)}
    </Badge>
  );
}
