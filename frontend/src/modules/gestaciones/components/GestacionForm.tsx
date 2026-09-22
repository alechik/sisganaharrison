import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import {
  useCreateGestacion,
  useServicioOptions,
  useUpdateGestacion,
} from "../hooks";
import { ESTADOS_GESTACION, GESTACION_ROUTES } from "../constants";
import { getGestacion } from "../services";
import { GestacionCreateRequest } from "../types";

interface Props {
  gestacionId?: number;
}

const emptyForm: GestacionCreateRequest = {
  servicio_id: 0,
  fecha_confirmacion: "",
  fecha_probable_parto: "",
  estado: "ACTIVA",
  observaciones: "",
};

export default function GestacionForm({ gestacionId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(gestacionId);

  const { create, loading: creating, error: createError, setError: setCreateError } =
    useCreateGestacion();
  const { update, loading: updating, error: updateError, setError: setUpdateError } =
    useUpdateGestacion();
  const {
    servicioOptions,
    loading: loadingOptions,
    error: optionsError,
  } = useServicioOptions({
    soloDisponiblesParaGestacion: true,
    incluirId: form.servicio_id,
  });

  const [form, setForm] = useState<GestacionCreateRequest>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [validationError, setValidationError] = useState<string | null>(null);

  const saving = creating || updating;
  const error = createError || updateError;

  useEffect(() => {
    if (!gestacionId) {
      return;
    }

    const loadGestacion = async () => {
      try {
        const gestacion = await getGestacion(gestacionId);
        setForm({
          servicio_id: gestacion.servicio_id,
          fecha_confirmacion: gestacion.fecha_confirmacion ?? "",
          fecha_probable_parto: gestacion.fecha_probable_parto ?? "",
          estado: gestacion.estado,
          observaciones: gestacion.observaciones ?? "",
        });
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar la gestación.");
      } finally {
        setLoading(false);
      }
    };

    loadGestacion();
  }, [gestacionId, setUpdateError]);

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

    if (!form.servicio_id) {
      setValidationError("Debe seleccionar un servicio reproductivo.");
      return;
    }

    if (!form.estado) {
      setValidationError("Debe seleccionar un estado.");
      return;
    }

    if (
      form.fecha_confirmacion &&
      form.fecha_probable_parto &&
      form.fecha_probable_parto < form.fecha_confirmacion
    ) {
      setValidationError(
        "La fecha probable de parto debe ser igual o posterior a la fecha de confirmación."
      );
      return;
    }

    const payload: GestacionCreateRequest = {
      ...form,
      fecha_confirmacion: form.fecha_confirmacion || null,
      fecha_probable_parto: form.fecha_probable_parto || null,
      observaciones: form.observaciones || null,
    };

    try {
      if (isEdit && gestacionId) {
        await update(gestacionId, payload);
        navigate(GESTACION_ROUTES.detail(gestacionId));
      } else {
        const response = await create(payload);
        navigate(GESTACION_ROUTES.detail(response.data.id));
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
          <Label>Servicio reproductivo</Label>
          <Select
            value={form.servicio_id ? String(form.servicio_id) : ""}
            placeholder="Seleccione un servicio reproductivo"
            options={servicioOptions}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                servicio_id: Number(value),
              }))
            }
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Solo servicios con resultado PREÑADA que aún no tienen gestación.
          </p>
        </div>

        <div>
          <Label>Fecha de confirmación</Label>
          <InputField
            type="date"
            name="fecha_confirmacion"
            value={form.fecha_confirmacion ?? ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Fecha probable de parto</Label>
          <InputField
            type="date"
            name="fecha_probable_parto"
            value={form.fecha_probable_parto ?? ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Estado</Label>
          <Select
            value={form.estado}
            placeholder="Seleccione el estado"
            options={ESTADOS_GESTACION.map((item) => ({
              value: item.value,
              label: item.label,
            }))}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                estado: value,
              }))
            }
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
          {saving
            ? "Guardando..."
            : isEdit
              ? "Actualizar Gestación"
              : "Registrar Gestación"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => navigate(GESTACION_ROUTES.list)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
