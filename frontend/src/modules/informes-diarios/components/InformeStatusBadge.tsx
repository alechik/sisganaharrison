import Badge from "@/components/ui/badge/Badge";
import { InformeRevisado } from "../types";

interface Props {
  revisado?: InformeRevisado | string | null;
}

export default function InformeStatusBadge({ revisado }: Props) {
  const isRevisado = revisado === "SI";

  return (
    <Badge size="sm" color={isRevisado ? "success" : "warning"}>
      {isRevisado ? "Revisado" : "Pendiente"}
    </Badge>
  );
}
