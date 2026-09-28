import { useState } from "react";
import { updateMedicamento } from "../services";
import { MedicamentoUpdateRequest } from "../types";

export const useUpdateMedicamento = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: MedicamentoUpdateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateMedicamento(id, data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo actualizar la medicamento.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, setError };
};
