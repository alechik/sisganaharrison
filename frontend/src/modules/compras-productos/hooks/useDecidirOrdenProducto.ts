import { useState } from "react";
import { autorizarOrdenProducto, cancelarOrdenProducto } from "../services";

export const useDecidirOrdenProducto = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autorizar = async (id: number, observacion?: string) => {
    setLoading(true);
    setError(null);
    try {
      return await autorizarOrdenProducto(id, observacion);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "No se pudo autorizar la orden.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelar = async (id: number, observacion?: string) => {
    setLoading(true);
    setError(null);
    try {
      return await cancelarOrdenProducto(id, observacion);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "No se pudo cancelar la orden.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { autorizar, cancelar, loading, error, setError };
};
