import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { getCategoriasProductos } from "@/modules/categorias-productos/services";
import { getPresentaciones } from "@/modules/presentaciones/services";
import { getSubcategoriasProductos } from "@/modules/subcategorias-productos/services";
import { PRODUCTO_ROUTES } from "../constants";
import { useCreateProducto } from "../hooks/useCreateProducto";
import { useUpdateProducto } from "../hooks/useUpdateProducto";
import { getProducto } from "../services";
import { ProductoCreateRequest } from "../types";

interface Props {
  productoId?: number;
}

const emptyForm: ProductoCreateRequest = {
  presentacion_id: 0,
  subcategoria_producto_id: 0,
  codigo: "",
  nombre: "",
  nombre_cientifico: "",
  precio: 0,
  descripcion: "",
};

export default function ProductoForm({ productoId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(productoId);
  const { create, loading: creating, error: createError, setError: setCreateError } = useCreateProducto();
  const { update, loading: updating, error: updateError, setError: setUpdateError } = useUpdateProducto();
  const [form, setForm] = useState<ProductoCreateRequest>(emptyForm);
  const [categoriaId, setCategoriaId] = useState(0);
  const [loading, setLoading] = useState(isEdit);
  const [presentaciones, setPresentaciones] = useState<{ value: string; label: string }[]>([]);
  const [categorias, setCategorias] = useState<{ value: string; label: string }[]>([]);
  const [subcategorias, setSubcategorias] = useState<{ value: string; label: string }[]>([]);

  const saving = creating || updating;
  const error = createError || updateError;

  useEffect(() => {
    getPresentaciones({ per_page: 100, sort_by: "nombre", sort_dir: "asc" })
      .then((res) =>
        setPresentaciones(res.data.map((item) => ({ value: String(item.id), label: item.nombre })))
      )
      .catch(console.error);
    getCategoriasProductos({ per_page: 100, activo: true, sort_by: "nombre", sort_dir: "asc" })
      .then((res) =>
        setCategorias(res.data.map((item) => ({ value: String(item.id), label: item.nombre })))
      )
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!categoriaId) {
      setSubcategorias([]);
      return;
    }
    getSubcategoriasProductos({
      per_page: 100,
      activo: true,
      categoria_producto_id: categoriaId,
      sort_by: "nombre",
      sort_dir: "asc",
    })
      .then((res) =>
        setSubcategorias(res.data.map((item) => ({ value: String(item.id), label: item.nombre })))
      )
      .catch(console.error);
  }, [categoriaId]);

  useEffect(() => {
    if (!productoId) {
      return;
    }

    const loadProducto = async () => {
      try {
        const producto = await getProducto(productoId);
        setCategoriaId(producto.categoria_producto_id ?? 0);
        setForm({
          presentacion_id: producto.presentacion_id,
          subcategoria_producto_id: producto.subcategoria_producto_id ?? 0,
          codigo: producto.codigo,
          nombre: producto.nombre,
          nombre_cientifico: producto.nombre_cientifico ?? "",
          precio: producto.precio,
          descripcion: producto.descripcion ?? "",
        });
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar el producto.");
      } finally {
        setLoading(false);
      }
    };

    loadProducto();
  }, [productoId, setUpdateError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((current) => ({
      ...current,
      [name]: name === "codigo" ? value.toUpperCase() : name === "precio" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setUpdateError(null);

    if (!form.presentacion_id) {
      setCreateError("Debe seleccionar una presentación.");
      return;
    }
    if (!form.subcategoria_producto_id) {
      setCreateError("Debe seleccionar una categoría y una subcategoría.");
      return;
    }

    try {
      if (isEdit && productoId) {
        await update(productoId, form);
        navigate(PRODUCTO_ROUTES.detail(productoId));
      } else {
        const response = await create(form);
        navigate(PRODUCTO_ROUTES.detail(response.data.id));
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
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Presentación *</Label>
          <Select
            value={form.presentacion_id ? String(form.presentacion_id) : ""}
            placeholder="Seleccione presentación"
            options={presentaciones}
            onChange={(value) => setForm((current) => ({ ...current, presentacion_id: Number(value) }))}
          />
        </div>
        <div>
          <Label>Categoría *</Label>
          <Select
            value={categoriaId ? String(categoriaId) : ""}
            placeholder="Seleccione categoría"
            options={categorias}
            onChange={(value) => {
              setCategoriaId(Number(value));
              setForm((current) => ({ ...current, subcategoria_producto_id: 0 }));
            }}
          />
        </div>
        <div>
          <Label>Subcategoría *</Label>
          <Select
            value={form.subcategoria_producto_id ? String(form.subcategoria_producto_id) : ""}
            placeholder="Seleccione subcategoría"
            options={subcategorias}
            onChange={(value) => setForm((current) => ({ ...current, subcategoria_producto_id: Number(value) }))}
          />
        </div>
        <div>
          <Label>Código *</Label>
          <InputField type="text" name="codigo" value={form.codigo} onChange={handleChange} />
        </div>
        <div>
          <Label>Nombre *</Label>
          <InputField type="text" name="nombre" value={form.nombre} onChange={handleChange} />
        </div>
        <div>
          <Label>Precio *</Label>
          <InputField
            type="number"
            name="precio"
            min="0"
            step={0.01}
            value={String(form.precio)}
            onChange={handleChange}
          />
        </div>
        <div className="md:col-span-2">
          <Label>Nombre científico</Label>
          <InputField
            type="text"
            name="nombre_cientifico"
            value={form.nombre_cientifico ?? ""}
            onChange={handleChange}
          />
        </div>
        <div className="md:col-span-2">
          <Label>Descripción *</Label>
          <TextArea
            rows={4}
            value={form.descripcion ?? ""}
            onChange={(value) => setForm((current) => ({ ...current, descripcion: value }))}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button size="sm" type="submit" disabled={saving}>
          {saving ? "Guardando..." : isEdit ? "Actualizar producto" : "Guardar producto"}
        </Button>
        <Button size="sm" variant="outline" type="button" onClick={() => navigate(PRODUCTO_ROUTES.list)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
