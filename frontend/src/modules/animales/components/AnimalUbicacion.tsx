import { Link } from "react-router-dom";

import { INGRESO_ROUTES } from "@/modules/compras/constants";
import { SALIDA_ROUTES } from "@/modules/salidas/constants";
import { TRASPASO_ROUTES } from "@/modules/traspasos/constants";
import { useAnimalUbicacion } from "../hooks";
import { MovimientoUbicacion, UbicacionLugar } from "../types";

interface Props {
  animalId: number;
}

const fecha = (value: string | null) => {
  if (!value) return "—";
  const [anio, mes, dia] = value.slice(0, 10).split("-");
  if (!anio || !mes || !dia) return value;
  return `${dia}/${mes}/${anio}`;
};

const lugar = (value: UbicacionLugar | null) => {
  if (!value) return "—";
  const partes = [
    value.establecimiento_nombre ? `Estancia ${value.establecimiento_nombre}` : null,
    value.potrero_nombre ? `Parcela ${value.potrero_nombre}` : null,
    value.lote_nombre ? `Potrero ${value.lote_nombre}` : null,
  ].filter((parte): parte is string => Boolean(parte));
  return partes.join(" · ") || "—";
};

const ruta = (movimiento: MovimientoUbicacion) => {
  if (movimiento.proceso === "traspasos") return TRASPASO_ROUTES.detail(movimiento.proceso_id);
  if (movimiento.proceso === "ingresos") return INGRESO_ROUTES.detail(movimiento.proceso_id);
  return SALIDA_ROUTES.detail(movimiento.proceso_id);
};

export default function AnimalUbicacion({ animalId }: Props) {
  const { ubicacion, loading, error } = useAnimalUbicacion(animalId);

  if (loading) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Cargando ubicación…</p>;
  }
  if (error) {
    return <p className="text-sm text-error-500">{error}</p>;
  }
  if (!ubicacion) return null;

  const actual = ubicacion.actual;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 p-4 dark:border-white/[0.05]">
        <p className="text-xs text-gray-500 dark:text-gray-400">Ubicación actual</p>
        <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white">
          {lugar(actual.ubicacion)}
        </p>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Último cambio: {fecha(actual.fecha_ultimo_cambio)}
        </p>
      </div>

      {ubicacion.historial.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Este animal no tiene movimientos de ubicación registrados.
        </p>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                <th className="px-3 py-2 font-medium">Fecha</th>
                <th className="px-3 py-2 font-medium">Tipo</th>
                <th className="px-3 py-2 font-medium">Origen</th>
                <th className="px-3 py-2 font-medium">Destino</th>
                <th className="px-3 py-2 font-medium">Referencia</th>
              </tr>
            </thead>
            <tbody>
              {ubicacion.historial.map((movimiento) => (
                <tr
                  key={`${movimiento.proceso}-${movimiento.proceso_id}`}
                  className="border-t border-gray-100 dark:border-white/[0.05]"
                >
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{fecha(movimiento.fecha)}</td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                    {movimiento.tipo_nombre}
                    {movimiento.observacion ? (
                      <span className="block text-xs text-gray-500 dark:text-gray-400">
                        {movimiento.observacion}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{lugar(movimiento.origen)}</td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{lugar(movimiento.destino)}</td>
                  <td className="px-3 py-2">
                    {movimiento.referencia ? (
                      <Link
                        to={ruta(movimiento)}
                        className="text-brand-600 hover:underline dark:text-brand-400"
                      >
                        {movimiento.referencia}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
