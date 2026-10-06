import Badge from "@/components/ui/badge/Badge";
import { Link } from "react-router-dom";
import { AlertaItem } from "../types";

const rutaDe = (alerta: AlertaItem) => {
  const id = alerta.referencia.id;
  if (alerta.referencia.proceso === "gestacion") return `/gestaciones/${id}`;
  if (alerta.referencia.proceso === "parto") return `/partos/${id}`;
  if (alerta.referencia.proceso === "servicio") return `/servicios-reproductivos/${id}`;
  if (alerta.animal) return `/animales/${alerta.animal.id}`;
  return null;
};

const nivel = (value: AlertaItem["nivel"]) => {
  if (value === "error") return "error" as const;
  if (value === "warning") return "warning" as const;
  return "info" as const;
};

const etiquetaNivel = (value: AlertaItem["nivel"]) => {
  if (value === "error") return "Crítica";
  if (value === "warning") return "Advertencia";
  return "Información";
};

export default function AlertList({ items }: { items: AlertaItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No hay alertas pendientes.</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((alerta) => {
        const ruta = rutaDe(alerta);
        const contenido = (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-800 dark:text-white/90">{alerta.titulo}</span>
              <Badge color={nivel(alerta.nivel)} size="sm">
                {etiquetaNivel(alerta.nivel)}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {alerta.animal ? `${alerta.animal.codigo}${alerta.animal.arete ? ` · ${alerta.animal.arete}` : ""}. ` : ""}
              {alerta.mensaje}
            </p>
            {alerta.fecha ? (
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{alerta.fecha}</p>
            ) : null}
          </>
        );

        return (
          <li key={`${alerta.tipo}-${alerta.referencia.proceso}-${alerta.referencia.id}`} className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
            {ruta ? (
              <Link to={ruta} className="block hover:opacity-80">
                {contenido}
              </Link>
            ) : (
              contenido
            )}
          </li>
        );
      })}
    </ul>
  );
}
