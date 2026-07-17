import Badge from "@/components/ui/badge/Badge";
import { getEstadoLabel } from "../utils";

interface Props {
  estado: string;
}

const estadoColorMap: Record<string, "success" | "warning" | "error" | "info"> = {
  ACTIVA: "success",
  FINALIZADA: "info",
  ABORTADA: "error",
  PERDIDA: "warning",
};

export default function GestacionEstadoBadge({ estado }: Props) {
  return (
    <Badge size="sm" color={estadoColorMap[estado] ?? "info"}>
      {getEstadoLabel(estado)}
    </Badge>
  );
}
