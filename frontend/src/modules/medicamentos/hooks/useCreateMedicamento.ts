import { useState } from "react";
import { createMedicamento } from "../services";
import { MedicamentoCreateRequest } from "../types";

export const useCreateMedicamento = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: MedicamentoCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createMedicamento(data);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo crear la medicamento.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, setError };
};
