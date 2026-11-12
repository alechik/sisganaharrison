import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { TIPO_SALIDA_ROUTES } from "../constants";
import { useCreateTipoSalida } from "../hooks/useCreateTipoSalida";
import { useUpdateTipoSalida } from "../hooks/useUpdateTipoSalida";
import { getTipoSalida } from "../services";
import { TipoSalidaCreateRequest } from "../types";

interface Props {
  tipoSalidaId?: number;
}

const emptyForm: TipoSalidaCreateRequest = {
  nombre: "",
  codigo: "",
  iniciales: "",
  descripcion: "",
  requiere_cliente: false,
};

export default function TipoSalidaForm({ tipoSalidaId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(tipoSalidaId);

  const {
    create,
    loading: creating,
    error: createError,
    setError: setCreateError,
  } = useCreateTipoSalida();
  const {
    update,
    loading: updating,
    error: updateError,
    setError: setUpdateError,
  } = useUpdateTipoSalida();

  const [form, setForm] = useState<TipoSalidaCreateRequest>(emptyForm);
  const [loading, setLoading] = useState(isEdit);

  const saving = creating || updating;
  const error = createError || updateError;

  useEffect(() => {
    if (!tipoSalidaId) {
      return;
    }

    const load = async () => {
      try {
        const tipo = await getTipoSalida(tipoSalidaId);
        setForm({
          nombre: tipo.nombre,
          codigo: tipo.codigo,
          iniciales: tipo.iniciales,
          descripcion: tipo.descripcion ?? "",
          requiere_cliente: tipo.requiere_cliente,
        });
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar el tipo de salida.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [tipoSalidaId, setUpdateError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((current) => ({
      ...current,
      [name]:
        name === "codigo" || name === "iniciales" ? value.toUpperCase().replace(/\s+/g, "") : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setUpdateError(null);

    try {
      if (isEdit && tipoSalidaId) {
        await update(tipoSalidaId, form);
        navigate(TIPO_SALIDA_ROUTES.detail(tipoSalidaId));
      } else {
        const response = await create(form);
        navigate(TIPO_SALIDA_ROUTES.detail(response.data.id));
      }
    } catch {
      // handled
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
          <InputField type="text" name="nombre" value={form.nombre} onChange={handleChange} />
        </div>

        <div>
          <Label>Código</Label>
          <InputField
            type="text"
            name="codigo"
            value={form.codigo}
            onChange={handleChange}
            placeholder="Ej: VENTA"
          />
        </div>

        <div>
          <Label>Iniciales (para el código de salida)</Label>
          <InputField
            type="text"
            name="iniciales"
            value={form.iniciales}
            onChange={handleChange}
            placeholder="Ej: V"
          />
          <p className="mt-1 text-xs text-gray-500">
            La salida se numerará como S + iniciales + correlativo, por ejemplo SV000001.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input
            id="requiere_cliente"
            type="checkbox"
            checked={Boolean(form.requiere_cliente)}
            onChange={(e) =>
              setForm((current) => ({ ...current, requiere_cliente: e.target.checked }))
            }
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="requiere_cliente">Requiere cliente o persona relacionada</Label>
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
          {saving ? "Guardando..." : isEdit ? "Actualizar tipo" : "Guardar tipo"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => navigate(TIPO_SALIDA_ROUTES.list)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
