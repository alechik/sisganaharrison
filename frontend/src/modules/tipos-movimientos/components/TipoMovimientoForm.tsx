import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { getTipoMovimiento } from "../services";
import { useCreateTipoMovimiento } from "../hooks/useCreateTipoMovimiento";
import { useUpdateTipoMovimiento } from "../hooks/useUpdateTipoMovimiento";
import { TIPO_MOVIMIENTO_ROUTES } from "../constants";
import { TipoMovimientoCreateRequest } from "../types";

interface Props {
  tipoMovimientoId?: number;
}

const emptyForm: TipoMovimientoCreateRequest = {
  nombre: "",
  codigo: "",
  descripcion: "",
};

export default function TipoMovimientoForm({ tipoMovimientoId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(tipoMovimientoId);

  const {
    create,
    loading: creating,
    error: createError,
    setError: setCreateError,
  } = useCreateTipoMovimiento();
  const {
    update,
    loading: updating,
    error: updateError,
    setError: setUpdateError,
  } = useUpdateTipoMovimiento();

  const [form, setForm] = useState<TipoMovimientoCreateRequest>(emptyForm);
  const [loading, setLoading] = useState(isEdit);

  const saving = creating || updating;
  const error = createError || updateError;

  useEffect(() => {
    if (!tipoMovimientoId) {
      return;
    }

    const loadEstado = async () => {
      try {
        const estado = await getTipoMovimiento(tipoMovimientoId);
        setForm({
          nombre: estado.nombre,
          codigo: estado.codigo,
          descripcion: estado.descripcion ?? "",
        });
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar el tipo de movimiento.");
      } finally {
        setLoading(false);
      }
    };

    loadEstado();
  }, [tipoMovimientoId, setUpdateError]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((current) => ({
      ...current,
      [name]: name === "codigo" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setUpdateError(null);

    try {
      if (isEdit && tipoMovimientoId) {
        await update(tipoMovimientoId, form);
        navigate(TIPO_MOVIMIENTO_ROUTES.detail(tipoMovimientoId));
      } else {
        const response = await create(form);
        navigate(TIPO_MOVIMIENTO_ROUTES.detail(response.data.id));
      }
    } catch {
      // Errors handled in hooks
    }
  };

  if (loading) {
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
          <Label>Código</Label>
          <InputField
            type="text"
            name="codigo"
            value={form.codigo}
            onChange={handleChange}
            placeholder="Ej: PRODUCCION"
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
          {saving
            ? "Guardando..."
            : isEdit
              ? "Actualizar Tipo"
              : "Guardar Tipo"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => navigate(TIPO_MOVIMIENTO_ROUTES.list)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
