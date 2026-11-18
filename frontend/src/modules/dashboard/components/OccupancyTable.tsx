import { PotreroOcupacion } from "../types";

export default function OccupancyTable({ potreros }: { potreros: PotreroOcupacion[] }) {
  if (potreros.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">No hay potreros activos.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 dark:text-gray-400">
            <th className="pb-3 font-medium">Potrero</th>
            <th className="pb-3 font-medium">Ocupación</th>
            <th className="pb-3 font-medium">Capacidad</th>
            <th className="pb-3 font-medium">%</th>
          </tr>
        </thead>
        <tbody>
          {potreros.map((potrero) => {
            const over = potrero.capacidad > 0 && potrero.ocupacion > potrero.capacidad;
            return (
              <tr
                key={potrero.codigo}
                className="border-t border-gray-100 dark:border-gray-800"
              >
                <td className="py-3 text-gray-800 dark:text-white/90">
                  {potrero.codigo} — {potrero.nombre}
                </td>
                <td className="py-3 text-gray-700 dark:text-gray-300">{potrero.ocupacion}</td>
                <td className="py-3 text-gray-700 dark:text-gray-300">{potrero.capacidad}</td>
                <td
                  className={`py-3 font-medium ${
                    over
                      ? "text-error-600 dark:text-error-500"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {potrero.pct === null ? "—" : `${potrero.pct}%`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
