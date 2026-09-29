import { LoteOcupacion } from "../types";

export default function OccupancyTable({ lotes }: { lotes: LoteOcupacion[] }) {
  if (lotes.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">No hay lotes activos.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 dark:text-gray-400">
            <th className="pb-3 font-medium">Lote</th>
            <th className="pb-3 font-medium">Ocupación</th>
            <th className="pb-3 font-medium">Capacidad</th>
            <th className="pb-3 font-medium">%</th>
          </tr>
        </thead>
        <tbody>
          {lotes.map((lote) => {
            const over = lote.capacidad > 0 && lote.ocupacion > lote.capacidad;
            return (
              <tr
                key={lote.codigo}
                className="border-t border-gray-100 dark:border-gray-800"
              >
                <td className="py-3 text-gray-800 dark:text-white/90">
                  {lote.codigo} — {lote.nombre}
                </td>
                <td className="py-3 text-gray-700 dark:text-gray-300">{lote.ocupacion}</td>
                <td className="py-3 text-gray-700 dark:text-gray-300">{lote.capacidad}</td>
                <td
                  className={`py-3 font-medium ${
                    over
                      ? "text-error-600 dark:text-error-500"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {lote.pct === null ? "—" : `${lote.pct}%`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
