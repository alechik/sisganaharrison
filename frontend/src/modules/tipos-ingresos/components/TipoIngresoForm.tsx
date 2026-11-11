import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { getTipoIngreso } from "../services";
import { useCreateTipoIngreso } from "../hooks/useCreateTipoIngreso";
import { useUpdateTipoIngreso } from "../hooks/useUpdateTipoIngreso";
import { TIPO_INGRESO_ROUTES } from "../constants";
import { TipoIngresoCreateRequest } from "../types";

interface Props {
  tipoId?: number;
}

const emptyForm: TipoIngresoCreateRequest = {
  nombre: "",
  codigo: "",
  iniciales: "",
  descripcion: "",
  requiere_proveedor: false,
};

export default function TipoIngresoForm({ tipoId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(tipoId);

  const { create, loading: creating, error: createError, setError: setCreateError } =
    useCreateTipoIngreso();
  const { update, loading: updating, error: updateError, setError: setUpdateError } =
    useUpdateTipoIngreso();

  const [form, setForm] = useState<TipoIngresoCreateRequest>(emptyForm);
  const [loading, setLoading] = useState(isEdit);

  const saving = creating || updating;
  const error = createError || updateError;

  useEffect(() => {
    if (!tipoId) {
      return;
    }

    const load = async () => {
      try {
        const tipo = await getTipoIngreso(tipoId);
        setForm({
          nombre: tipo.nombre,
          codigo: tipo.codigo,
          iniciales: tipo.iniciales,
          descripcion: tipo.descripcion ?? "",
          requiere_proveedor: tipo.requiere_proveedor,
        });
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar el tipo de ingreso.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [tipoId, setUpdateError]);

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
      if (isEdit && tipoId) {
        await update(tipoId, form);
        navigate(TIPO_INGRESO_ROUTES.detail(tipoId));
      } else {
        const response = await create(form);
        navigate(TIPO_INGRESO_ROUTES.detail(response.data.id));
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
          <InputField type="text" name="nombre" value={form.nombre} onChange={handleChange} />
        </div>

        <div>
          <Label>Código</Label>
          <InputField
            type="text"
            name="codigo"
            value={form.codigo}
            onChange={handleChange}
            placeholder="Ej: COMPRA"
          />
        </div>

        <div>
          <Label>Iniciales (para el código de ingreso)</Label>
          <InputField
            type="text"
            name="iniciales"
            value={form.iniciales}
            onChange={handleChange}
            placeholder="Ej: CO"
          />
          <p className="mt-1 text-xs text-gray-500">
            El ingreso se numerará como IN + iniciales + correlativo, por ejemplo INCO000001.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input
            id="requiere_proveedor"
            type="checkbox"
            checked={Boolean(form.requiere_proveedor)}
            onChange={(e) =>
              setForm((current) => ({ ...current, requiere_proveedor: e.target.checked }))
            }
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="requiere_proveedor">Requiere proveedor o persona relacionada</Label>
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
        <Button size="sm" variant="outline" type="button" onClick={() => navigate(TIPO_INGRESO_ROUTES.list)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
