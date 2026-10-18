import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { getCategoriasProductos } from "@/modules/categorias-productos/services";
import { getSubcategoriaProducto } from "../services";
import { useCreateSubcategoriaProducto } from "../hooks/useCreateSubcategoriaProducto";
import { useUpdateSubcategoriaProducto } from "../hooks/useUpdateSubcategoriaProducto";
import { SUBCATEGORIA_PRODUCTO_ROUTES } from "../constants";
import { SubcategoriaProductoCreateRequest } from "../types";

interface Props {
  subcategoriaId?: number;
}

const emptyForm: SubcategoriaProductoCreateRequest = {
  categoria_producto_id: 0,
  nombre: "",
};

export default function SubcategoriaProductoForm({ subcategoriaId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(subcategoriaId);

  const { create, loading: creating, error: createError, setError: setCreateError } =
    useCreateSubcategoriaProducto();
  const { update, loading: updating, error: updateError, setError: setUpdateError } =
    useUpdateSubcategoriaProducto();

  const [form, setForm] = useState<SubcategoriaProductoCreateRequest>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [categorias, setCategorias] = useState<{ value: string; label: string }[]>([]);

  const saving = creating || updating;
  const error = createError || updateError;

  useEffect(() => {
    getCategoriasProductos({ per_page: 100, activo: true, sort_by: "nombre", sort_dir: "asc" })
      .then((res) => setCategorias(res.data.map((item) => ({ value: String(item.id), label: item.nombre }))))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!subcategoriaId) {
      return;
    }

    const load = async () => {
      try {
        const item = await getSubcategoriaProducto(subcategoriaId);
        setForm({
          categoria_producto_id: item.categoria_producto_id,
          nombre: item.nombre,
        });
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar la subcategoría.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [subcategoriaId, setUpdateError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setUpdateError(null);

    if (!form.categoria_producto_id) {
      setCreateError("Debe seleccionar una categoría.");
      return;
    }

    try {
      if (isEdit && subcategoriaId) {
        await update(subcategoriaId, form);
        navigate(SUBCATEGORIA_PRODUCTO_ROUTES.detail(subcategoriaId));
      } else {
        const response = await create(form);
        navigate(SUBCATEGORIA_PRODUCTO_ROUTES.detail(response.data.id));
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
          <Label>Categoría</Label>
          <Select
            value={form.categoria_producto_id ? String(form.categoria_producto_id) : ""}
            placeholder="Seleccione una categoría"
            options={categorias}
            onChange={(value) =>
              setForm((current) => ({ ...current, categoria_producto_id: Number(value) }))
            }
          />
        </div>

        <div>
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
          {saving ? "Guardando..." : isEdit ? "Actualizar subcategoría" : "Guardar subcategoría"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => navigate(SUBCATEGORIA_PRODUCTO_ROUTES.list)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
