import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { getCategoriaProducto } from "../services";
import { useCreateCategoriaProducto } from "../hooks/useCreateCategoriaProducto";
import { useUpdateCategoriaProducto } from "../hooks/useUpdateCategoriaProducto";
import { CATEGORIA_PRODUCTO_ROUTES } from "../constants";
import { CategoriaProductoCreateRequest } from "../types";

interface Props {
  categoriaId?: number;
}

const emptyForm: CategoriaProductoCreateRequest = {
  nombre: "",
};

export default function CategoriaProductoForm({ categoriaId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(categoriaId);

  const { create, loading: creating, error: createError, setError: setCreateError } =
    useCreateCategoriaProducto();
  const { update, loading: updating, error: updateError, setError: setUpdateError } =
    useUpdateCategoriaProducto();

  const [form, setForm] = useState<CategoriaProductoCreateRequest>(emptyForm);
  const [loading, setLoading] = useState(isEdit);

  const saving = creating || updating;
  const error = createError || updateError;

  useEffect(() => {
    if (!categoriaId) {
      return;
    }

    const load = async () => {
      try {
        const item = await getCategoriaProducto(categoriaId);
        setForm({ nombre: item.nombre });
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar la categoría de producto.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [categoriaId, setUpdateError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setUpdateError(null);

    try {
      if (isEdit && categoriaId) {
        await update(categoriaId, form);
        navigate(CATEGORIA_PRODUCTO_ROUTES.detail(categoriaId));
      } else {
        const response = await create(form);
        navigate(CATEGORIA_PRODUCTO_ROUTES.detail(response.data.id));
      }
    } catch {
      // handled in hooks
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
        <div className="md:col-span-2">
          <Label>Nombre</Label>
          <InputField
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={(e) => setForm((current) => ({ ...current, nombre: e.target.value }))}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button size="sm" type="submit" disabled={saving}>
          {saving ? "Guardando..." : isEdit ? "Actualizar categoría" : "Guardar categoría"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => navigate(CATEGORIA_PRODUCTO_ROUTES.list)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
