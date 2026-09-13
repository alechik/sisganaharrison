import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { getCategoriasAnimales } from "@/modules/categorias-animales/services";
import { getSocios } from "@/modules/socios-de-negocio/services";
import { CUARENTENA_ROUTES } from "../constants";
import { useCreateCuarentena, useUpdateCuarentena } from "../hooks";
import { getCuarentena } from "../services";
import { CuarentenaCreateRequest, CuarentenaDetalleRequest } from "../types";
import { formatMoney, formatPeso } from "../utils";

interface Props {
  cuarentenaId?: number;
}

const emptyLine = (): CuarentenaDetalleRequest => ({
  categoria_animal_id: 0,
  cantidad: 1,
  peso: 0,
  precio: 0,
  descuento: 0,
});

const today = () => new Date().toISOString().slice(0, 10);

export default function CuarentenaForm({ cuarentenaId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(cuarentenaId);
  const { create, loading: creating, error: createError, setError: setCreateError } =
    useCreateCuarentena();
  const { update, loading: updating, error: updateError, setError: setUpdateError } =
    useUpdateCuarentena();

  const [proveedores, setProveedores] = useState<{ value: string; label: string }[]>([]);
  const [categorias, setCategorias] = useState<{ value: string; label: string }[]>([]);
  const [form, setForm] = useState<CuarentenaCreateRequest>({
    proveedor_id: 0,
    fecha_inicio: today(),
    descuento: 0,
    detalles: [emptyLine()],
  });
  const [loading, setLoading] = useState(isEdit);

  const saving = creating || updating;
  const error = createError || updateError;

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [socios, cats] = await Promise.all([
          getSocios({ tiene_tipo: "PROVEEDOR", per_page: 100, page: 1 }),
          getCategoriasAnimales({ activo: true, per_page: 100, page: 1 }),
        ]);
        setProveedores(
          socios.data.map((socio) => ({
            value: String(socio.id),
            label: socio.razon_social,
          }))
        );
        setCategorias(
          cats.data.map((categoria) => ({
            value: String(categoria.id),
            label: `${categoria.codigo} — ${categoria.nombre}`,
          }))
        );
      } catch (err) {
        console.error(err);
        setCreateError("No se pudieron cargar proveedores o categorías.");
      }
    };

    loadOptions();
  }, [setCreateError]);

  useEffect(() => {
    if (!cuarentenaId) {
      return;
    }

    const load = async () => {
      try {
        const item = await getCuarentena(cuarentenaId);
        setForm({
          proveedor_id: item.proveedor_id,
          fecha_inicio: item.fecha_inicio,
          descuento: item.descuento,
          detalles: (item.detalles ?? []).map((detalle) => ({
            categoria_animal_id: detalle.categoria_animal_id,
            cantidad: detalle.cantidad,
            peso: detalle.peso,
            precio: detalle.precio,
            descuento: detalle.descuento,
          })),
        });
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar la cuarentena.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [cuarentenaId, setUpdateError]);

  const lineSubtotal = (line: CuarentenaDetalleRequest) =>
    Math.max((line.cantidad || 0) * (line.precio || 0) - (line.descuento || 0), 0);

  const preview = useMemo(() => {
    const suma = form.detalles.reduce((acc, line) => acc + lineSubtotal(line), 0);
    const totalPeso = form.detalles.reduce(
      (acc, line) => acc + (line.cantidad || 0) * (line.peso || 0),
      0
    );
    return {
      suma,
      totalPeso,
      total: Math.max(suma - (form.descuento ?? 0), 0),
    };
  }, [form.detalles, form.descuento]);

  const updateLine = (index: number, partial: Partial<CuarentenaDetalleRequest>) => {
    setForm((current) => ({
      ...current,
      detalles: current.detalles.map((line, i) => (i === index ? { ...line, ...partial } : line)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.proveedor_id) {
      setCreateError("Debe seleccionar un proveedor.");
      return;
    }
    if (form.detalles.some((line) => !line.categoria_animal_id || line.cantidad < 1 || !line.peso || line.peso <= 0)) {
      setCreateError("Cada línea debe tener categoría, cantidad y peso del ejemplar mayor a cero.");
      return;
    }

    const payload: CuarentenaCreateRequest = { ...form, descuento: form.descuento ?? 0 };

    try {
      if (isEdit && cuarentenaId) {
        await update(cuarentenaId, payload);
      } else {
        await create(payload);
      }
      navigate(CUARENTENA_ROUTES.list);
    } catch {
      // handled
    }
  };

  if (loading) {
    return <div>Cargando formulario...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!isEdit && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
          Cuarentena directa por excepción. No se genera una orden de compra.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Proveedor</Label>
          <Select
            value={form.proveedor_id ? String(form.proveedor_id) : ""}
            placeholder="Seleccione un proveedor"
            options={proveedores}
            onChange={(value) => setForm((current) => ({ ...current, proveedor_id: Number(value) }))}
          />
        </div>
        <div>
          <Label>Fecha de inicio</Label>
          <InputField
            type="date"
            value={form.fecha_inicio}
            onChange={(e) => setForm((current) => ({ ...current, fecha_inicio: e.target.value }))}
          />
        </div>
        <div>
          <Label>Descuento general</Label>
          <InputField
            type="number"
            value={String(form.descuento ?? 0)}
            onChange={(e) =>
              setForm((current) => ({ ...current, descuento: Number(e.target.value) || 0 }))
            }
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 dark:text-white">Detalle por categoría</h3>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              setForm((current) => ({ ...current, detalles: [...current.detalles, emptyLine()] }))
            }
          >
            + Línea
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          No se registran animales definitivos. El alta se resolverá en el Ingreso.
        </p>
        {form.detalles.map((line, index) => (
          <div
            key={index}
            className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 p-4 dark:border-white/[0.05] md:grid-cols-6"
          >
            <div className="md:col-span-2">
              <Label>Categoría</Label>
              <Select
                value={line.categoria_animal_id ? String(line.categoria_animal_id) : ""}
                placeholder="Seleccione categoría"
                options={categorias}
                onChange={(value) => updateLine(index, { categoria_animal_id: Number(value) })}
              />
            </div>
            <div>
              <Label>Cantidad</Label>
              <InputField
                type="number"
                value={String(line.cantidad)}
                onChange={(e) => updateLine(index, { cantidad: Number(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Peso ejemplar (kg)</Label>
              <InputField
                type="number"
                step={0.01}
                value={String(line.peso ?? 0)}
                onChange={(e) => updateLine(index, { peso: Number(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Precio</Label>
              <InputField
                type="number"
                value={String(line.precio)}
                onChange={(e) => updateLine(index, { precio: Number(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Desc. línea</Label>
              <InputField
                type="number"
                value={String(line.descuento ?? 0)}
                onChange={(e) => updateLine(index, { descuento: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-end justify-between gap-2 md:col-span-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Peso línea: {formatPeso((line.cantidad || 0) * (line.peso || 0))} · Subtotal:{" "}
                {formatMoney(lineSubtotal(line))}
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    detalles:
                      current.detalles.length === 1
                        ? current.detalles
                        : current.detalles.filter((_, i) => i !== index),
                  }))
                }
              >
                Quitar
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-gray-50 p-4 text-sm dark:bg-white/[0.03]">
        <p>Total peso: {formatPeso(preview.totalPeso)}</p>
        <p>Suma de líneas: {formatMoney(preview.suma)}</p>
        <p>Descuento general: {formatMoney(form.descuento ?? 0)}</p>
        <p className="font-semibold text-gray-800 dark:text-white">
          Monto total: {formatMoney(preview.total)}
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => navigate(CUARENTENA_ROUTES.list)}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Registrar cuarentena"}
        </Button>
      </div>
    </form>
  );
}
