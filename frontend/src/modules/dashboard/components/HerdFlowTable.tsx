import { FlujoMensual } from "../types";

const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const etiqueta = (mes: string) => {
  const [anio, numero] = mes.split("-");
  return `${meses[Number(numero) - 1] ?? mes} ${anio}`;
};

export default function HerdFlowTable({ items }: { items: FlujoMensual[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Sin datos</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm text-gray-700 dark:text-gray-300">
        <thead className="text-xs uppercase text-gray-500 dark:text-gray-400">
          <tr>
            <th className="px-3 py-2">Mes</th>
            <th className="px-3 py-2">Ingresos</th>
            <th className="px-3 py-2">Nacimientos</th>
            <th className="px-3 py-2">Muertes</th>
            <th className="px-3 py-2">Ventas</th>
            <th className="px-3 py-2">Otras bajas</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.mes} className="border-t border-gray-100 dark:border-gray-800">
              <td className="px-3 py-2">{etiqueta(item.mes)}</td>
              <td className="px-3 py-2">{item.ingresos}</td>
              <td className="px-3 py-2">{item.nacimientos}</td>
              <td className="px-3 py-2">{item.muertes}</td>
              <td className="px-3 py-2">{item.ventas}</td>
              <td className="px-3 py-2">{item.otras_bajas}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
