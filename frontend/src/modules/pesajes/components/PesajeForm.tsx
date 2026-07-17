import { useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { useActiveAnimalOptions, useCreatePesaje } from "../hooks";
import { PESAJE_ROUTES } from "../constants";
import { PesajeCreateRequest } from "../types";

const emptyForm: PesajeCreateRequest = {
  animal_id: 0,
  fecha: "",
  peso: 0,
  observaciones: "",
};

export default function PesajeForm() {
  const navigate = useNavigate();
  const { create, loading: saving, error, setError } = useCreatePesaje();
  const { animalOptions, loading: loadingAnimals, error: animalsError } = useActiveAnimalOptions();

  const [form, setForm] = useState<PesajeCreateRequest>(emptyForm);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((current) => ({
      ...current,
      [name]: name === "peso" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationError(null);

    if (!form.animal_id) {
      setValidationError("Debe seleccionar un animal.");
      return;
    }

    if (!form.fecha) {
      setValidationError("La fecha es obligatoria.");
      return;
    }

    if (!form.peso || form.peso <= 0) {
      setValidationError("El peso debe ser mayor a 0.");
      return;
    }

    try {
      const response = await create(form);
      navigate(PESAJE_ROUTES.detail(response.data.id));
    } catch {
      // Errors handled in hook
    }
  };

  if (loadingAnimals) {
    return <div>Cargando formulario...</div>;
  }

  const displayError = validationError || error || animalsError;

  return (
    <form onSubmit={handleSubmit}>
      {displayError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {displayError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Animal</Label>
          <Select
            value={form.animal_id ? String(form.animal_id) : ""}
            placeholder="Seleccione un animal activo"
            options={animalOptions}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                animal_id: Number(value),
              }))
            }
          />
        </div>

        <div>
          <Label>Fecha</Label>
          <InputField
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Peso (kg)</Label>
          <InputField
            type="number"
            name="peso"
            min="0.01"
            step={0.01}
            value={form.peso || ""}
            onChange={handleChange}
            placeholder="Ej: 450.50"
          />
        </div>

        <div className="md:col-span-2">
          <Label>Observaciones</Label>
          <TextArea
            rows={4}
            value={form.observaciones ?? ""}
            onChange={(value) => setForm((current) => ({ ...current, observaciones: value }))}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button size="sm" type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Registrar Pesaje"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => navigate(PESAJE_ROUTES.list)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
