import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { LOTE_ROUTES } from "../constants";
import { useActivePotreroOptions } from "../hooks/useActivePotreroOptions";
import { useCreateLote } from "../hooks/useCreateLote";
import { useUpdateLote } from "../hooks/useUpdateLote";
import { getLote } from "../services";
import { LoteCreateRequest } from "../types";

interface Props {
  loteId?: number;
}

const emptyForm: LoteCreateRequest = {
  potrero_id: 0,
  codigo: "",
  nombre: "",
  capacidad_animales: 0,
  area_ha: null,
  observaciones: "",
};

export default function LoteForm({ loteId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(loteId);

  const {
    options: potreroOptions,
    loading: loadingPotreros,
    error: potrerosError,
  } = useActivePotreroOptions();

  const {
    create,
    loading: creating,
    error: createError,
    setError: setCreateError,
  } = useCreateLote();
  const {
    update,
    loading: updating,
    error: updateError,
    setError: setUpdateError,
  } = useUpdateLote();

  const [form, setForm] = useState<LoteCreateRequest>(emptyForm);
  const [loading, setLoading] = useState(isEdit);

  const saving = creating || updating;
  const error = createError || updateError || potrerosError;

  useEffect(() => {
    if (!loteId) {
      return;
    }

    const loadLote = async () => {
      try {
        const lote = await getLote(loteId);
        setForm({
          potrero_id: lote.potrero_id,
          codigo: lote.codigo,
          nombre: lote.nombre,
          capacidad_animales: lote.capacidad_animales,
          area_ha: lote.area_ha,
          observaciones: lote.observaciones ?? "",
        });
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar el lote.");
      } finally {
        setLoading(false);
      }
    };

    loadLote();
  }, [loteId, setUpdateError]);

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

    if (!form.potrero_id) {
      setCreateError("Debe seleccionar un potrero.");
      return;
    }

    try {
      if (isEdit && loteId) {
        await update(loteId, form);
        navigate(LOTE_ROUTES.detail(loteId));
      } else {
        const response = await create(form);
        navigate(LOTE_ROUTES.detail(response.data.id));
      }
    } catch {
      // Errors handled in hooks
    }
  };

  if (loading || loadingPotreros) {
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
          <Label>Potrero</Label>
          <Select
            value={form.potrero_id ? String(form.potrero_id) : ""}
            placeholder="Seleccione un potrero"
            options={potreroOptions}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                potrero_id: Number(value),
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
          {saving ? "Guardando..." : isEdit ? "Actualizar Lote" : "Guardar Lote"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => navigate(LOTE_ROUTES.list)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
