import Badge from "@/components/ui/badge/Badge";
import { getEstadoLabel } from "../utils";

interface Props {
  estado?: string | null;
}

export default function CuarentenaStatusBadge({ estado }: Props) {
  return (
    <Badge size="sm" color={estado === "COMPLETADO" ? "success" : "warning"}>
      {getEstadoLabel(estado)}
    </Badge>
  );
}
