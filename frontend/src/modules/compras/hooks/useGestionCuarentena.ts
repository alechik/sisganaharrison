import { useState } from "react";
import { completarCuarentena, generarCuarentenaDesdeOrden } from "../services";

export const useGestionCuarentena = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generarDesdeOrden = async (ordenId: number) => {
    setLoading(true);
    setError(null);
    try {
      return await generarCuarentenaDesdeOrden(ordenId);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo generar la cuarentena.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completar = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      return await completarCuarentena(id);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo completar la cuarentena.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generarDesdeOrden, completar, loading, error, setError };
};
