import Badge from "@/components/ui/badge/Badge";

interface Props {
  estado?: string | null;
}

export default function SalidaStatusBadge({ estado }: Props) {
  return (
    <Badge size="sm" color={estado === "REGISTRADO" ? "success" : "light"}>
      {estado === "REGISTRADO" ? "Registrada" : estado || "—"}
    </Badge>
  );
}
