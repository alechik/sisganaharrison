import { useState } from "react";
import { anularVenta, autorizarVenta } from "../services";

export const useDecidirVenta = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autorizar = async (id: number, observacion?: string) => {
    setLoading(true);
    setError(null);
    try {
      return await autorizarVenta(id, observacion);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo autorizar la venta.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const anular = async (id: number, observacion?: string) => {
    setLoading(true);
    setError(null);
    try {
      return await anularVenta(id, observacion);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo anular la venta.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { autorizar, anular, loading, error, setError };
};
