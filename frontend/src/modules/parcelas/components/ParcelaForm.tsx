import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { PARCELA_ROUTES } from "../constants";
import { useActiveEstanciaOptions } from "../hooks/useActiveEstanciaOptions";
import { useCreateParcela } from "../hooks/useCreateParcela";
import { useUpdateParcela } from "../hooks/useUpdateParcela";
import { getParcela } from "../services";
import { ParcelaCreateRequest } from "../types";

interface Props {
  parcelaId?: number;
}

const emptyForm: ParcelaCreateRequest = {
  estancia_id: 0,
  codigo: "",
  nombre: "",
  area_ha: null,
  tipo_pasto: "",
  disponibilidad: true,
  descripcion: "",
};

export default function ParcelaForm({ parcelaId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(parcelaId);

  const {
    options: estanciaOptions,
    loading: loadingEstancias,
    error: estanciasError,
  } = useActiveEstanciaOptions();

  const {
    create,
    loading: creating,
    error: createError,
    setError: setCreateError,
  } = useCreateParcela();
  const {
    update,
    loading: updating,
    error: updateError,
    setError: setUpdateError,
  } = useUpdateParcela();

  const [form, setForm] = useState<ParcelaCreateRequest>(emptyForm);
  const [loading, setLoading] = useState(isEdit);

  const saving = creating || updating;
  const error = createError || updateError || estanciasError;

  useEffect(() => {
    if (!parcelaId) {
      return;
    }

    const loadParcela = async () => {
      try {
        const parcela = await getParcela(parcelaId);
        setForm({
          estancia_id: parcela.estancia_id,
          codigo: parcela.codigo,
          nombre: parcela.nombre,
          area_ha: parcela.area_ha,
          tipo_pasto: parcela.tipo_pasto ?? "",
          disponibilidad: parcela.disponibilidad,
          descripcion: parcela.descripcion ?? "",
        });
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar la parcela.");
      } finally {
        setLoading(false);
      }
    };

    loadParcela();
  }, [parcelaId, setUpdateError]);

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

    if (!form.estancia_id) {
      setCreateError("Debe seleccionar una estancia.");
      return;
    }

    try {
      if (isEdit && parcelaId) {
        await update(parcelaId, form);
        navigate(PARCELA_ROUTES.detail(parcelaId));
      } else {
        const response = await create(form);
        navigate(PARCELA_ROUTES.detail(response.data.id));
      }
    } catch {
      // Errors handled in hooks
    }
  };

  if (loading || loadingEstancias) {
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
          <Label>Estancia</Label>
          <Select
            value={form.estancia_id ? String(form.estancia_id) : ""}
            placeholder="Seleccione una estancia"
            options={estanciaOptions}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                estancia_id: Number(value),
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
          {saving ? "Guardando..." : isEdit ? "Actualizar Parcela" : "Guardar Parcela"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => navigate(PARCELA_ROUTES.list)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
