import Badge from "@/components/ui/badge/Badge";
import { getEstadoNacimientoLabel } from "../utils";

interface Props {
  estado: string;
}

const colorMap: Record<string, "success" | "error"> = {
  VIVO: "success",
  MUERTO: "error",
};

export default function NacimientoEstadoBadge({ estado }: Props) {
  return (
    <Badge size="sm" color={colorMap[estado] ?? "info"}>
      {getEstadoNacimientoLabel(estado)}
    </Badge>
  );
}
