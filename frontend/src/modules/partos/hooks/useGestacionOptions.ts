import { useEffect, useState } from "react";
import { getGestaciones } from "@/modules/gestaciones/services";
import { Gestacion } from "@/modules/gestaciones/types";
import {
  formatAnimalLabel,
  getEstadoLabel,
  getTipoServicioLabel,
} from "@/modules/gestaciones/utils";

interface SelectOption {
  value: string;
  label: string;
}

const formatGestacionOptionLabel = (gestacion: Gestacion): string => {
  const hembra = formatAnimalLabel(
    gestacion.servicio_hembra_codigo,
    gestacion.servicio_hembra_arete
  );
  const fecha = gestacion.servicio_fecha_servicio
    ? new Date(`${gestacion.servicio_fecha_servicio}T00:00:00`).toLocaleDateString("es-PY")
    : "Sin fecha";
  const tipo = getTipoServicioLabel(gestacion.servicio_tipo_servicio);
  const estado = getEstadoLabel(gestacion.estado);
  return `#${gestacion.id} · ${hembra} · ${fecha} · ${tipo} · ${estado}`;
};

export const useGestacionOptions = () => {
  const [gestacionOptions, setGestacionOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGestaciones = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getGestaciones({
          page: 1,
          per_page: 100,
          sort_by: "fecha_probable_parto",
          sort_dir: "desc",
        });

        setGestacionOptions(
          response.data.map((gestacion) => ({
            value: String(gestacion.id),
            label: formatGestacionOptionLabel(gestacion),
          }))
        );
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las gestaciones.");
      } finally {
        setLoading(false);
      }
    };

    loadGestaciones();
  }, []);

  return { gestacionOptions, loading, error };
};
