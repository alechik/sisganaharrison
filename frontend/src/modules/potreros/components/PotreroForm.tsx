import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { POTRERO_ROUTES } from "../constants";
import { useActiveEstablecimientoOptions } from "../hooks/useActiveEstablecimientoOptions";
import { useCreatePotrero } from "../hooks/useCreatePotrero";
import { useUpdatePotrero } from "../hooks/useUpdatePotrero";
import { getPotrero } from "../services";
import { PotreroCreateRequest } from "../types";

interface Props {
  potreroId?: number;
}

const emptyForm: PotreroCreateRequest = {
  establecimiento_id: 0,
  codigo: "",
  nombre: "",
  area_ha: null,
  tipo_pasto: "",
  disponibilidad: true,
  descripcion: "",
};

export default function PotreroForm({ potreroId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(potreroId);

  const {
    options: establecimientoOptions,
    loading: loadingEstablecimientos,
    error: establecimientosError,
  } = useActiveEstablecimientoOptions();

  const {
    create,
    loading: creating,
    error: createError,
    setError: setCreateError,
  } = useCreatePotrero();
  const {
    update,
    loading: updating,
    error: updateError,
    setError: setUpdateError,
  } = useUpdatePotrero();

  const [form, setForm] = useState<PotreroCreateRequest>(emptyForm);
  const [loading, setLoading] = useState(isEdit);

  const saving = creating || updating;
  const error = createError || updateError || establecimientosError;

  useEffect(() => {
    if (!potreroId) {
      return;
    }

    const loadPotrero = async () => {
      try {
        const potrero = await getPotrero(potreroId);
        setForm({
          establecimiento_id: potrero.establecimiento_id,
          codigo: potrero.codigo,
          nombre: potrero.nombre,
          area_ha: potrero.area_ha,
          tipo_pasto: potrero.tipo_pasto ?? "",
          disponibilidad: potrero.disponibilidad,
          descripcion: potrero.descripcion ?? "",
        });
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar el potrero.");
      } finally {
        setLoading(false);
      }
    };

    loadPotrero();
  }, [potreroId, setUpdateError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((current) => ({
      ...current,
      [name]:
        name === "codigo"
          ? value.toUpperCase()
          : name === "area_ha"
            ? value === ""
              ? null
              : Number(value)
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setUpdateError(null);

    if (!form.establecimiento_id) {
      setCreateError("Debe seleccionar un establecimiento.");
      return;
    }

    try {
      if (isEdit && potreroId) {
        await update(potreroId, form);
        navigate(POTRERO_ROUTES.detail(potreroId));
      } else {
        const response = await create(form);
        navigate(POTRERO_ROUTES.detail(response.data.id));
      }
    } catch {
      // Errors handled in hooks
    }
  };

  if (loading || loadingEstablecimientos) {
    return <div>Cargando formulario...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>Establecimiento</Label>
          <Select
            value={form.establecimiento_id ? String(form.establecimiento_id) : ""}
            placeholder="Seleccione un establecimiento"
            options={establecimientoOptions}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                establecimiento_id: Number(value),
              }))
            }
          />
        </div>

        <div>
          <Label>Código</Label>
          <InputField
            type="text"
            name="codigo"
            value={form.codigo}
            onChange={handleChange}
            placeholder="Ej: POT_CARMEN_N"
          />
        </div>

        <div>
          <Label>Nombre</Label>
          <InputField
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Área (ha)</Label>
          <InputField
            type="number"
            name="area_ha"
            value={form.area_ha ?? ""}
            onChange={handleChange}
            min="0"
            step={0.01}
          />
        </div>

        <div>
          <Label>Tipo de pasto</Label>
          <InputField
            type="text"
            name="tipo_pasto"
            value={form.tipo_pasto ?? ""}
            onChange={handleChange}
            placeholder="Ej: Brachiaria"
          />
        </div>

        <div>
          <Label>Disponibilidad</Label>
          <Select
            value={form.disponibilidad ? "true" : "false"}
            options={[
              { value: "true", label: "Disponible" },
              { value: "false", label: "No disponible" },
            ]}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                disponibilidad: value === "true",
              }))
            }
          />
        </div>

        <div className="md:col-span-2">
          <Label>Descripción</Label>
          <TextArea
            rows={4}
            value={form.descripcion ?? ""}
            onChange={(value) => setForm((current) => ({ ...current, descripcion: value }))}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button size="sm" type="submit" disabled={saving}>
          {saving ? "Guardando..." : isEdit ? "Actualizar Potrero" : "Guardar Potrero"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => navigate(POTRERO_ROUTES.list)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
