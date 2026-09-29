import { ActividadItem } from "../types";

const etiquetas: Record<string, string> = {
  ingreso: "Ingreso",
  venta: "Venta",
  salida: "Salida",
  traspaso: "Traspaso",
  pesaje: "Pesaje",
  sanitario: "Evento sanitario",
};

export default function RecentActivity({ items }: { items: ActividadItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">Aún no hay actividad reciente.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li
          key={`${item.tipo}-${item.referencia}-${index}`}
          className="flex items-center justify-between gap-3 text-sm"
        >
          <div>
            <p className="font-medium text-gray-800 dark:text-white/90">
              {etiquetas[item.tipo] ?? item.tipo}
            </p>
            <p className="text-gray-500 dark:text-gray-400">{item.referencia}</p>
          </div>
          <span className="shrink-0 text-gray-400 dark:text-gray-500">{item.fecha}</span>
        </li>
      ))}
    </ul>
  );
}
