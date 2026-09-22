import Badge from "@/components/ui/badge/Badge";
import { getEstadoPartoLabel } from "../utils";

interface Props {
  estado?: string | null;
}

const estadoColorMap: Record<string, "warning" | "info"> = {
  PENDIENTE: "warning",
  FINALIZADA: "info",
};

export default function PartoEstadoBadge({ estado }: Props) {
  const value = estado || "PENDIENTE";

  return (
    <Badge size="sm" color={estadoColorMap[value] ?? "info"}>
      {getEstadoPartoLabel(value)}
    </Badge>
  );
}
