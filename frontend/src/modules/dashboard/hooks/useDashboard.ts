import { useEffect, useState } from "react";
import { DashboardConsulta, getDashboard } from "../services";
import { DashboardData } from "../types";

export const useDashboard = (consulta: DashboardConsulta | null) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const periodo = consulta?.periodo ?? "";
  const desde = consulta?.desde ?? "";
  const hasta = consulta?.hasta ?? "";

  useEffect(() => {
    if (!periodo || (periodo === "rango" && (!desde || !hasta))) {
      setLoading(false);
      return;
    }

    const consulta: DashboardConsulta =
      periodo === "rango" ? { periodo, desde, hasta } : { periodo };
    let activo = true;

    const cargar = async () => {
      try {
        setLoading(true);
        setError(null);
        const resultado = await getDashboard(consulta);
        if (activo) {
          setData(resultado);
        }
      } catch {
        if (activo) {
          setError("No se pudo cargar el dashboard.");
          setData(null);
        }
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    };

    void cargar();

    return () => {
      activo = false;
    };
  }, [periodo, desde, hasta]);

  return { data, loading, error };
};
