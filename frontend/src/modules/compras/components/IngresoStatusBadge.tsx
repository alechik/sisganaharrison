import Badge from "@/components/ui/badge/Badge";
import { getEstadoLabel } from "../utils";

interface Props {
  estado?: string | null;
}

export default function IngresoStatusBadge({ estado }: Props) {
  return (
    <Badge size="sm" color="success">
      {getEstadoLabel(estado)}
    </Badge>
  );
}
