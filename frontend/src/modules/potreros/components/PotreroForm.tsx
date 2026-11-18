import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { POTRERO_ROUTES } from "../constants";
import { useActiveParcelaOptions } from "../hooks/useActiveParcelaOptions";
import { useCreatePotrero } from "../hooks/useCreatePotrero";
import { useUpdatePotrero } from "../hooks/useUpdatePotrero";
import { getPotrero } from "../services";
import { PotreroCreateRequest } from "../types";

interface Props {
  potreroId?: number;
}

const emptyForm: PotreroCreateRequest = {
  parcela_id: 0,
  codigo: "",
  nombre: "",
  capacidad_animales: 0,
  area_ha: null,
  observaciones: "",
};

export default function PotreroForm({ potreroId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(potreroId);

  const {
    options: parcelaOptions,
    loading: loadingParcelas,
    error: parcelasError,
  } = useActiveParcelaOptions();

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
  const error = createError || updateError || parcelasError;

  useEffect(() => {
    if (!potreroId) {
      return;
    }

    const loadPotrero = async () => {
      try {
        const potrero = await getPotrero(potreroId);
        setForm({
          parcela_id: potrero.parcela_id,
          codigo: potrero.codigo,
          nombre: potrero.nombre,
          capacidad_animales: potrero.capacidad_animales,
          area_ha: potrero.area_ha,
          observaciones: potrero.observaciones ?? "",
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
            : name === "capacidad_animales"
              ? value === ""
                ? 0
                : Number(value)
              : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setUpdateError(null);

    if (!form.parcela_id) {
      setCreateError("Debe seleccionar una parcela.");
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

  if (loading || loadingParcelas) {
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
          <Label>Parcela</Label>
          <Select
            value={form.parcela_id ? String(form.parcela_id) : ""}
            placeholder="Seleccione una parcela"
            options={parcelaOptions}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                parcela_id: Number(value),
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
            placeholder="Ej: LOT_CARMEN_ENG"
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
          <Label>Capacidad de animales</Label>
          <InputField
            type="number"
            name="capacidad_animales"
            value={form.capacidad_animales ?? 0}
            onChange={handleChange}
            min="0"
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
