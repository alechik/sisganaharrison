import Badge from "@/components/ui/badge/Badge";
import { getOrigenLabel } from "../utils";

interface Props {
  origen?: string | null;
}

export default function CuarentenaOrigenBadge({ origen }: Props) {
  return (
    <Badge size="sm" color={origen === "DIRECTA" ? "info" : "primary"}>
      {getOrigenLabel(origen)}
    </Badge>
  );
}
