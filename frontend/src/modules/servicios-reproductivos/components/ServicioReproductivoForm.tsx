import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import {
  useCreateServicioReproductivo,
  useReproduccionAnimalOptions,
  useUpdateServicioReproductivo,
} from "../hooks";
import { RESULTADOS_SERVICIO, SERVICIO_REPRODUCTIVO_ROUTES, TIPOS_SERVICIO } from "../constants";
import { getServicioReproductivo } from "../services";
import { ServicioReproductivoCreateRequest } from "../types";

interface Props {
  servicioId?: number;
}

const emptyForm: ServicioReproductivoCreateRequest = {
  hembra_id: 0,
  macho_id: null,
  fecha_servicio: "",
  tipo_servicio: "",
  resultado: null,
  observaciones: "",
};

export default function ServicioReproductivoForm({ servicioId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(servicioId);

  const { create, loading: creating, error: createError, setError: setCreateError } =
    useCreateServicioReproductivo();
  const { update, loading: updating, error: updateError, setError: setUpdateError } =
    useUpdateServicioReproductivo();

  const [form, setForm] = useState<ServicioReproductivoCreateRequest>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [validationError, setValidationError] = useState<string | null>(null);

  const {
    hembraOptions,
    machoOptions,
    loading: loadingOptions,
    error: optionsError,
  } = useReproduccionAnimalOptions({
    soloConArete: true,
    incluirHembraId: isEdit ? form.hembra_id : undefined,
    incluirMachoId: isEdit ? form.macho_id ?? undefined : undefined,
  });

  const saving = creating || updating;
  const error = createError || updateError;

  useEffect(() => {
    if (!servicioId) {
      return;
    }

    const loadServicio = async () => {
      try {
        const servicio = await getServicioReproductivo(servicioId);
        setForm({
          hembra_id: servicio.hembra_id,
          macho_id: servicio.macho_id,
          fecha_servicio: servicio.fecha_servicio,
          tipo_servicio: servicio.tipo_servicio,
          resultado: servicio.resultado,
          observaciones: servicio.observaciones ?? "",
        });
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar el servicio reproductivo.");
      } finally {
        setLoading(false);
      }
    };

    loadServicio();
  }, [servicioId, setUpdateError]);

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

    if (!form.hembra_id) {
      setValidationError("Debe seleccionar una hembra.");
      return;
    }

    if (!hembraOptions.some((option) => option.value === String(form.hembra_id))) {
      setValidationError("Debe seleccionar una hembra activa con arete válido.");
      return;
    }

    if (
      form.macho_id &&
      !machoOptions.some((option) => option.value === String(form.macho_id))
    ) {
      setValidationError("Debe seleccionar un macho activo con arete válido.");
      return;
    }

    if (!form.fecha_servicio) {
      setValidationError("La fecha de servicio es obligatoria.");
      return;
    }

    if (!form.tipo_servicio) {
      setValidationError("Debe seleccionar un tipo de servicio.");
      return;
    }

    if (form.macho_id && form.macho_id === form.hembra_id) {
      setValidationError("La hembra y el macho no pueden ser el mismo animal.");
      return;
    }

    const payload: ServicioReproductivoCreateRequest = {
      ...form,
      macho_id: form.macho_id || null,
      resultado: form.resultado || null,
    };

    try {
      if (isEdit && servicioId) {
        await update(servicioId, payload);
        navigate(SERVICIO_REPRODUCTIVO_ROUTES.detail(servicioId));
      } else {
        const response = await create(payload);
        navigate(SERVICIO_REPRODUCTIVO_ROUTES.detail(response.data.id));
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
        <div>
          <Label>Hembra</Label>
          <Select
            value={form.hembra_id ? String(form.hembra_id) : ""}
            placeholder="Seleccione una hembra con arete"
            options={hembraOptions}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                hembra_id: Number(value),
              }))
            }
          />
        </div>

        <div>
          <Label>Macho (opcional)</Label>
          <Select
            value={form.macho_id ? String(form.macho_id) : ""}
            placeholder="Sin macho / seleccione un macho con arete"
            options={[
              { value: "", label: "Sin macho" },
              ...machoOptions.filter((option) => Number(option.value) !== form.hembra_id),
            ]}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                macho_id: value ? Number(value) : null,
              }))
            }
          />
        </div>

        <div>
          <Label>Fecha de servicio</Label>
          <InputField
            type="date"
            name="fecha_servicio"
            value={form.fecha_servicio}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Tipo de servicio</Label>
          <Select
            value={form.tipo_servicio}
            placeholder="Seleccione el tipo"
            options={TIPOS_SERVICIO.map((item) => ({
              value: item.value,
              label: item.label,
            }))}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                tipo_servicio: value,
              }))
            }
          />
        </div>

        <div>
          <Label>Resultado</Label>
          <Select
            value={form.resultado ?? ""}
            placeholder="Sin resultado"
            options={[
              { value: "", label: "Sin resultado" },
              ...RESULTADOS_SERVICIO.map((item) => ({
                value: item.value,
                label: item.label,
              })),
            ]}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                resultado: value || null,
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
              ? "Actualizar Servicio"
              : "Registrar Servicio"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => navigate(SERVICIO_REPRODUCTIVO_ROUTES.list)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
