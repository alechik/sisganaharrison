import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { useCreateParto, useGestacionOptions, useUpdateParto } from "../hooks";
import { PARTO_ROUTES } from "../constants";
import { getParto } from "../services";
import { PartoCreateRequest } from "../types";

interface Props {
  partoId?: number;
}

const emptyForm: PartoCreateRequest = {
  gestacion_id: 0,
  fecha_parto: "",
  observaciones: "",
};

export default function PartoForm({ partoId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(partoId);

  const { create, loading: creating, error: createError, setError: setCreateError } =
    useCreateParto();
  const { update, loading: updating, error: updateError, setError: setUpdateError } =
    useUpdateParto();
  const {
    gestacionOptions,
    loading: loadingOptions,
    error: optionsError,
  } = useGestacionOptions();

  const [form, setForm] = useState<PartoCreateRequest>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [validationError, setValidationError] = useState<string | null>(null);

  const saving = creating || updating;
  const error = createError || updateError;

  useEffect(() => {
    if (!partoId) {
      return;
    }

    const loadParto = async () => {
      try {
        const parto = await getParto(partoId);
        setForm({
          gestacion_id: parto.gestacion_id,
          fecha_parto: parto.fecha_parto,
          observaciones: parto.observaciones ?? "",
        });
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar el parto.");
      } finally {
        setLoading(false);
      }
    };

    loadParto();
  }, [partoId, setUpdateError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setUpdateError(null);
    setValidationError(null);

    if (!form.gestacion_id) {
      setValidationError("Debe seleccionar una gestación.");
      return;
    }

    if (!form.fecha_parto) {
      setValidationError("La fecha de parto es obligatoria.");
      return;
    }

    const payload: PartoCreateRequest = {
      ...form,
      observaciones: form.observaciones || null,
    };

    try {
      if (isEdit && partoId) {
        await update(partoId, payload);
        navigate(PARTO_ROUTES.detail(partoId));
      } else {
        const response = await create(payload);
        navigate(PARTO_ROUTES.detail(response.data.id));
      }
    } catch {
      // Errors handled in hooks
    }
  };

  if (loading || loadingOptions) {
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
        <div className="md:col-span-2">
          <Label>Gestación</Label>
          <Select
            value={form.gestacion_id ? String(form.gestacion_id) : ""}
            placeholder="Seleccione una gestación"
            options={gestacionOptions}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                gestacion_id: Number(value),
              }))
            }
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Al registrar el parto, la gestación se marcará como finalizada.
          </p>
        </div>

        <div>
          <Label>Fecha de parto</Label>
          <InputField
            type="date"
            name="fecha_parto"
            value={form.fecha_parto}
            onChange={handleChange}
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
          {saving ? "Guardando..." : isEdit ? "Actualizar Parto" : "Registrar Parto"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => navigate(PARTO_ROUTES.list)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
