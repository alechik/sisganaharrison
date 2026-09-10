import Badge from "@/components/ui/badge/Badge";
import { TipoPersona } from "../types";
import { esCliente, esProveedor } from "../utils";

interface Props {
  tipos?: TipoPersona[] | null;
}

export default function SocioTipoBadges({ tipos }: Props) {
  const cliente = esCliente(tipos);
  const proveedor = esProveedor(tipos);

  if (!cliente && !proveedor) {
    return <span className="text-theme-sm text-gray-400">—</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {cliente && (
        <Badge size="sm" color="info">Cliente</Badge>
      )}
      {proveedor && (
        <Badge size="sm" color="warning">Proveedor</Badge>
      )}
    </div>
  );
}
