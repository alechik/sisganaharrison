import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import RegistradoPorField from "@/components/form/RegistradoPorField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { getMedicamentos } from "@/modules/medicamentos/services";
import { getSocios } from "@/modules/socios-de-negocio/services";
import { ORDEN_PRODUCTO_ROUTES } from "../constants";
import { useCreateOrdenProducto, useUpdateOrdenProducto } from "../hooks";
import { getOrdenProducto } from "../services";
import { OrdenCompraProductoCreateRequest, OrdenCompraProductoDetalleRequest } from "../types";
import { formatMoney, isPendiente } from "../utils";

interface Props {
  ordenId?: number;
}

const emptyLine = (): OrdenCompraProductoDetalleRequest => ({
  medicamento_id: 0,
  cantidad: 1,
  precio: 0,
  descuento: 0,
});

const today = () => new Date().toISOString().slice(0, 10);

export default function OrdenProductoForm({ ordenId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(ordenId);
  const { create, loading: creating, error: createError, setError: setCreateError } =
    useCreateOrdenProducto();
  const { update, loading: updating, error: updateError, setError: setUpdateError } =
    useUpdateOrdenProducto();

  const [proveedores, setProveedores] = useState<{ value: string; label: string }[]>([]);
  const [productos, setProductos] = useState<{ id: number; nombre: string; precio: number }[]>([]);
  const [form, setForm] = useState<OrdenCompraProductoCreateRequest>({
    proveedor_id: 0,
    fecha: today(),
    descuento: 0,
    detalles: [emptyLine()],
  });
  const [loading, setLoading] = useState(isEdit);
  const [registradoPorNombre, setRegistradoPorNombre] = useState<string | null>(null);

  const saving = creating || updating;
  const error = createError || updateError;

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [socios, meds] = await Promise.all([
          getSocios({ tiene_tipo: "PROVEEDOR", per_page: 100, page: 1 }),
          getMedicamentos({ activo: true, per_page: 100, page: 1 }),
        ]);
        setProveedores(
          socios.data.map((socio) => ({
            value: String(socio.id),
            label: socio.razon_social,
          }))
        );
        setProductos(
          meds.data.map((item) => ({
            id: item.id,
            nombre: `${item.codigo} — ${item.nombre}`,
            precio: item.precio,
          }))
        );
      } catch (err) {
        console.error(err);
        setCreateError("No se pudieron cargar proveedores o productos.");
      }
    };

    loadOptions();
  }, [setCreateError]);

  useEffect(() => {
    if (!ordenId) {
      return;
    }

    const load = async () => {
      try {
        const orden = await getOrdenProducto(ordenId);
        if (!isPendiente(orden.estado)) {
          setUpdateError("Solo una orden pendiente puede modificarse.");
          return;
        }
        setForm({
          proveedor_id: orden.proveedor_id,
          fecha: orden.fecha,
          descuento: orden.descuento,
          detalles: (orden.detalles ?? []).map((detalle) => ({
            medicamento_id: detalle.medicamento_id,
            cantidad: detalle.cantidad,
            precio: detalle.precio,
            descuento: detalle.descuento,
          })),
        });
        setRegistradoPorNombre(orden.creador_nombre ?? null);
      } catch (err) {
        console.error(err);
        setUpdateError("No se pudo cargar la orden de compra de productos.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [ordenId, setUpdateError]);

  const lineSubtotal = (line: OrdenCompraProductoDetalleRequest) =>
    Math.max((line.cantidad || 0) * (line.precio || 0) - (line.descuento || 0), 0);

  const preview = useMemo(() => {
    const suma = form.detalles.reduce((acc, line) => acc + lineSubtotal(line), 0);
    const identificados = form.detalles.reduce((acc, line) => acc + (line.cantidad || 0), 0);
    const descuentoCabecera = form.descuento ?? 0;
    return {
      suma,
      identificados,
      total: Math.max(suma - descuentoCabecera, 0),
    };
  }, [form.detalles, form.descuento]);

  const updateLine = (index: number, partial: Partial<OrdenCompraProductoDetalleRequest>) => {
    setForm((current) => ({
      ...current,
      detalles: current.detalles.map((line, i) => (i === index ? { ...line, ...partial } : line)),
    }));
  };

  const addLine = () => {
    setForm((current) => ({ ...current, detalles: [...current.detalles, emptyLine()] }));
  };

  const removeLine = (index: number) => {
    setForm((current) => ({
      ...current,
      detalles: current.detalles.length === 1 ? current.detalles : current.detalles.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.proveedor_id) {
      setCreateError("Debe seleccionar un proveedor.");
      return;
    }

    if (form.detalles.some((line) => !line.medicamento_id || line.cantidad < 1 || line.precio < 0)) {
      setCreateError("Cada línea debe tener producto, cantidad mayor a cero y precio válido.");
      return;
    }

    const payload: OrdenCompraProductoCreateRequest = {
      ...form,
      descuento: form.descuento ?? 0,
      detalles: form.detalles.map((line) => ({
        medicamento_id: line.medicamento_id,
        cantidad: line.cantidad,
        precio: line.precio,
        descuento: line.descuento ?? 0,
      })),
    };

    try {
      if (isEdit && ordenId) {
        await update(ordenId, payload);
      } else {
        await create(payload);
      }
      navigate(ORDEN_PRODUCTO_ROUTES.list);
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
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
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
          <Label>Fecha</Label>
          <InputField
            type="date"
            value={form.fecha}
            onChange={(e) => setForm((current) => ({ ...current, fecha: e.target.value }))}
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
        {isEdit ? <RegistradoPorField nombre={registradoPorNombre} /> : null}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 dark:text-white">Productos</h3>
          <Button type="button" size="sm" variant="outline" onClick={addLine}>
            + Producto
          </Button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          La orden se guarda en estado Pendiente. Gerencia puede autorizarla o cancelarla después.
        </p>
        {form.detalles.map((line, index) => (
          <div
            key={index}
            className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 p-4 dark:border-white/[0.05] md:grid-cols-4"
          >
            <div className="md:col-span-2">
              <Label>Producto</Label>
              <Select
                value={line.medicamento_id ? String(line.medicamento_id) : ""}
                placeholder="Seleccione un producto"
                options={productos.map((item) => ({ value: String(item.id), label: item.nombre }))}
                onChange={(value) => {
                  const prod = productos.find((item) => item.id === Number(value));
                  updateLine(index, {
                    medicamento_id: Number(value),
                    precio: prod?.precio ?? line.precio,
                  });
                }}
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
            <div className="flex items-end justify-between gap-2 md:col-span-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Subtotal: {formatMoney(lineSubtotal(line))}
              </p>
              <Button type="button" size="sm" variant="outline" onClick={() => removeLine(index)}>
                Quitar
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-gray-50 p-4 text-sm dark:bg-white/[0.03]">
        <p>Unidades: {preview.identificados}</p>
        <p>Suma de líneas: {formatMoney(preview.suma)}</p>
        <p>Descuento general: {formatMoney(form.descuento ?? 0)}</p>
        <p className="font-semibold text-gray-800 dark:text-white">
          Monto total: {formatMoney(preview.total)}
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => navigate(ORDEN_PRODUCTO_ROUTES.list)}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Registrar orden"}
        </Button>
      </div>
    </form>
  );
}
