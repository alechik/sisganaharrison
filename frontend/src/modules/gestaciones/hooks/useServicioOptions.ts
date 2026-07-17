import { useEffect, useState } from "react";
import { getServiciosReproductivos } from "@/modules/servicios-reproductivos/services";
import { ServicioReproductivo } from "@/modules/servicios-reproductivos/types";
import {
  formatAnimalLabel,
  getTipoServicioLabel,
} from "@/modules/servicios-reproductivos/utils";

interface SelectOption {
  value: string;
  label: string;
}

const formatServicioOptionLabel = (servicio: ServicioReproductivo): string => {
  const hembra = formatAnimalLabel(servicio.hembra_codigo, servicio.hembra_arete);
  const fecha = servicio.fecha_servicio
    ? new Date(`${servicio.fecha_servicio}T00:00:00`).toLocaleDateString("es-PY")
    : "Sin fecha";
  const tipo = getTipoServicioLabel(servicio.tipo_servicio);
  return `#${servicio.id} · ${hembra} · ${fecha} · ${tipo}`;
};

export const useServicioOptions = () => {
  const [servicioOptions, setServicioOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadServicios = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getServiciosReproductivos({
          page: 1,
          per_page: 100,
          sort_by: "fecha_servicio",
          sort_dir: "desc",
        });

        setServicioOptions(
          response.data.map((servicio) => ({
            value: String(servicio.id),
            label: formatServicioOptionLabel(servicio),
          }))
        );
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los servicios reproductivos.");
      } finally {
        setLoading(false);
      }
    };

    loadServicios();
  }, []);

  return { servicioOptions, loading, error };
};
