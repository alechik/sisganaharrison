import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { useCreateEventoSanitario, useSanitarioReferenceOptions } from "../hooks";
import { EVENTO_SANITARIO_ROUTES } from "../constants";
import { EventoSanitarioCreateRequest } from "../types";
import { tipoRequiereVacuna } from "../utils";

const emptyForm: EventoSanitarioCreateRequest = {
  animal_id: 0,
  tipo_evento_id: 0,
  vacuna_id: null,
  fecha: "",
  diagnostico: "",
  tratamiento: "",
  observaciones: "",
};

export default function EventoSanitarioForm() {
  const navigate = useNavigate();
  const { create, loading: saving, error, setError } = useCreateEventoSanitario();
  const {
    animalOptions,
    tipoEventoOptions,
    vacunaOptions,
    loading: loadingOptions,
    error: optionsError,
  } = useSanitarioReferenceOptions();

  const [form, setForm] = useState<EventoSanitarioCreateRequest>(emptyForm);
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedTipo = useMemo(
    () => tipoEventoOptions.find((tipo) => Number(tipo.value) === form.tipo_evento_id),
    [tipoEventoOptions, form.tipo_evento_id]
  );

  const requiereVacuna = tipoRequiereVacuna(selectedTipo?.codigo);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((current) => ({
      ...current,
      [name]: value,
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

    if (!form.tipo_evento_id) {
      setValidationError("Debe seleccionar un tipo de evento.");
      return;
    }

    if (!form.fecha) {
      setValidationError("La fecha es obligatoria.");
      return;
    }

    if (requiereVacuna && !form.vacuna_id) {
      setValidationError("La vacuna es obligatoria para eventos de vacunación.");
      return;
    }

    const payload: EventoSanitarioCreateRequest = {
      ...form,
      vacuna_id: requiereVacuna ? form.vacuna_id : form.vacuna_id || null,
    };

    try {
      const response = await create(payload);
      navigate(EVENTO_SANITARIO_ROUTES.detail(response.data.id));
    } catch {
      // Errors handled in hook
    }
  };

  if (loadingOptions) {
    return <div>Cargando formulario...</div>;
  }

  const displayError = validationError || error || optionsError;

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
          <Label>Tipo de evento</Label>
          <Select
            value={form.tipo_evento_id ? String(form.tipo_evento_id) : ""}
            placeholder="Seleccione un tipo activo"
            options={tipoEventoOptions}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                tipo_evento_id: Number(value),
                vacuna_id: null,
              }))
            }
          />
        </div>

        <div>
          <Label>Vacuna {requiereVacuna ? "" : "(opcional)"}</Label>
          <Select
            value={form.vacuna_id ? String(form.vacuna_id) : ""}
            placeholder={
              requiereVacuna
                ? "Seleccione una vacuna activa"
                : "No aplica o seleccione si corresponde"
            }
            options={[
              ...(requiereVacuna ? [] : [{ value: "", label: "Sin vacuna" }]),
              ...vacunaOptions,
            ]}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                vacuna_id: value ? Number(value) : null,
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

        <div className="md:col-span-2">
          <Label>Diagnóstico</Label>
          <TextArea
            rows={3}
            value={form.diagnostico ?? ""}
            onChange={(value) => setForm((current) => ({ ...current, diagnostico: value }))}
          />
        </div>

        <div className="md:col-span-2">
          <Label>Tratamiento</Label>
          <TextArea
            rows={3}
            value={form.tratamiento ?? ""}
            onChange={(value) => setForm((current) => ({ ...current, tratamiento: value }))}
          />
        </div>

        <div className="md:col-span-2">
          <Label>Observaciones</Label>
          <TextArea
            rows={3}
            value={form.observaciones ?? ""}
            onChange={(value) => setForm((current) => ({ ...current, observaciones: value }))}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button size="sm" type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Registrar Evento Sanitario"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => navigate(EVENTO_SANITARIO_ROUTES.list)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
