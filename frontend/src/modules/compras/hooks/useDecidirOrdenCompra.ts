import { useState } from "react";
import { autorizarOrdenCompra, rechazarOrdenCompra } from "../services";

export const useDecidirOrdenCompra = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autorizar = async (id: number, observacion?: string) => {
    setLoading(true);
    setError(null);
    try {
      return await autorizarOrdenCompra(id, observacion);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo autorizar la orden.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rechazar = async (id: number, observacion?: string) => {
    setLoading(true);
    setError(null);
    try {
      return await rechazarOrdenCompra(id, observacion);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo rechazar la orden.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { autorizar, rechazar, loading, error, setError };
};
