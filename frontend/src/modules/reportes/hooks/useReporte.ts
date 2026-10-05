import { useState } from "react";
import { isAxiosError } from "axios";
import { getReporte } from "../services";
import { Reporte, ReporteFiltros } from "../types";

const mensajeDe = (error: unknown) => {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || "No se pudo generar el reporte.";
  }
  return "No se pudo generar el reporte.";
};

export const useReporte = () => {
  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generar = async (filtros: ReporteFiltros) => {
    try {
      setLoading(true);
      setError(null);
      setReporte(await getReporte(filtros));
    } catch (err) {
      setReporte(null);
      setError(mensajeDe(err));
    } finally {
      setLoading(false);
    }
  };

  return { reporte, loading, error, generar };
};
