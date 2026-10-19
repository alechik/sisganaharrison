import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { getAlmacenes } from "@/modules/almacenes/services";
import { INGRESO_PRODUCTO_ROUTES } from "../constants";
import { useCreateIngresoProducto } from "../hooks";
import { getOrdenesProductos, traerOrdenProducto } from "../services";
import { OrdenCompraProducto, OrdenCompraProductoDetalle } from "../types";
import { formatMoney, isAutorizado } from "../utils";

interface LineState extends OrdenCompraProductoDetalle {
  cantidad_pendiente: number;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function IngresoProductoForm() {
  const navigate = useNavigate();
  const { create, loading, error, setError } = useCreateIngresoProducto();

  const [ordenes, setOrdenes] = useState<OrdenCompraProducto[]>([]);
  const [almacenes, setAlmacenes] = useState<{ value: string; label: string }[]>([]);
  const [ordenId, setOrdenId] = useState(0);
  const [loadedOrdenId, setLoadedOrdenId] = useState<number | null>(null);
  const [almacenId, setAlmacenId] = useState(0);
  const [fecha, setFecha] = useState(today());
  const [descuento, setDescuento] = useState(0);
  const [observaciones, setObservaciones] = useState("");
  const [proveedorLabel, setProveedorLabel] = useState("");
  const [lines, setLines] = useState<LineState[]>([]);
  const [loadingTraer, setLoadingTraer] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [ordenesRes, almacenesRes] = await Promise.all([
          getOrdenesProductos({ per_page: 100, estado: "AUTORIZADO", sort_by: "cod_compra", sort_dir: "desc" }),
          getAlmacenes({ per_page: 100, activo: true }),
        ]);
        setOrdenes(ordenesRes.data.filter((item) => isAutorizado(item.estado)));
        setAlmacenes(almacenesRes.data.map((item) => ({ value: String(item.id), label: item.nombre })));
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las órdenes autorizadas o los almacenes.");
      }
    };

    load();
  }, [setError]);

  const handleOrdenChange = (value: string) => {
    const nextId = Number(value);
    setOrdenId(nextId);
    if (nextId !== loadedOrdenId) {
      setLines([]);
      setLoadedOrdenId(null);
      setProveedorLabel("");
    }
  };

  const handleTraer = async () => {
    if (!ordenId) {
      setError("Debe seleccionar una orden de compra autorizada.");
      return;
    }

    try {
      setLoadingTraer(true);
      setError(null);
      const orden = await traerOrdenProducto(ordenId);
      if (!isAutorizado(orden.estado)) {
        setError("Solo se pueden ingresar productos de una orden autorizada.");
        setLines([]);
        setLoadedOrdenId(null);
        return;
      }

      const sameOrder = loadedOrdenId === orden.id;
      const previous = Object.fromEntries(lines.map((line) => [line.medicamento_id, line]));
      const nextLines: LineState[] = (orden.detalles ?? [])
        .map((detalle) => {
          const pendiente = detalle.cantidad_pendiente ?? detalle.cantidad;
          const prev = sameOrder ? previous[detalle.medicamento_id] : undefined;
          const cantidad = prev
            ? Math.min(Math.max(prev.cantidad, 0), pendiente)
            : pendiente;
          return {
            ...detalle,
            cantidad,
            descuento: prev?.descuento ?? detalle.descuento ?? 0,
            cantidad_pendiente: pendiente,
          };
        })
        .filter((line) => line.cantidad_pendiente > 0);

      if (nextLines.length === 0) {
        setError("Esta orden no tiene cantidades pendientes de ingresar.");
        setLines([]);
        setLoadedOrdenId(orden.id);
        return;
      }

      if (!sameOrder) {
        setFecha(orden.fecha || today());
        setDescuento(orden.descuento ?? 0);
      }

      setProveedorLabel(
        `${orden.proveedor_razon_social || "—"}${orden.proveedor_nit ? ` · NIT ${orden.proveedor_nit}` : ""}`
      );
      setLines(nextLines);
      setLoadedOrdenId(orden.id);
    } catch (err) {
      console.error(err);
      setError("No se pudo traer la orden. Verifique que esté autorizada.");
    } finally {
      setLoadingTraer(false);
    }
  };

  const updateLine = (index: number, partial: Partial<LineState>) => {
    setLines((current) => current.map((line, i) => (i === index ? { ...line, ...partial } : line)));
  };

  const preview = useMemo(() => {
    const suma = lines.reduce(
      (acc, line) => acc + Math.max((line.cantidad || 0) * (line.precio || 0) - (line.descuento || 0), 0),
      0
    );
    const unidades = lines.reduce((acc, line) => acc + (line.cantidad || 0), 0);
    return { suma, unidades, total: Math.max(suma - (descuento || 0), 0) };
  }, [lines, descuento]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ordenId || loadedOrdenId !== ordenId) {
      setError("Debe seleccionar una orden autorizada y pulsar Traer.");
      return;
    }
    if (!almacenId) {
      setError("Debe seleccionar un almacén.");
      return;
    }
    if (lines.length === 0 || lines.some((line) => line.cantidad < 1)) {
      setError("Cada producto debe tener una cantidad mayor a cero y pendiente de la orden.");
      return;
    }
    if (lines.some((line) => line.cantidad > line.cantidad_pendiente)) {
      setError("Hay cantidades que superan lo pendiente de la orden.");
      return;
    }

    try {
      const response = await create({
        orden_compra_id: ordenId,
        almacen_id: almacenId,
        fecha,
        descuento,
        observaciones: observaciones || null,
        detalles: lines.map((line) => ({
          medicamento_id: line.medicamento_id,
          cantidad: line.cantidad,
          precio: line.precio,
          descuento: line.descuento ?? 0,
        })),
      });
      navigate(INGRESO_PRODUCTO_ROUTES.detail(response.data.id));
    } catch {
      // handled
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <Label>Orden de compra</Label>
          <Select
            value={ordenId ? String(ordenId) : ""}
            placeholder="Seleccione el código de la orden"
            options={ordenes.map((orden) => ({
              value: String(orden.id),
              label: orden.cod_compra,
            }))}
            onChange={handleOrdenChange}
          />
        </div>
        <div className="flex items-end">
          <Button type="button" size="sm" onClick={handleTraer} disabled={loadingTraer}>
            {loadingTraer ? "Trayendo..." : "Traer"}
          </Button>
        </div>
        <div>
          <Label>Almacén</Label>
          <Select
            value={almacenId ? String(almacenId) : ""}
            placeholder="Seleccione un almacén"
            options={almacenes}
            onChange={(value) => setAlmacenId(Number(value))}
          />
        </div>
        <div>
          <Label>Proveedor</Label>
          <InputField type="text" value={proveedorLabel || "Se completa al traer la orden"} disabled />
        </div>
        <div>
          <Label>Fecha de ingreso</Label>
          <InputField type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
        <div>
          <Label>Descuento general</Label>
          <InputField
            type="number"
            value={String(descuento)}
            onChange={(e) => setDescuento(Number(e.target.value) || 0)}
          />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <Label>Observación general</Label>
          <TextArea value={observaciones} onChange={setObservaciones} rows={3} />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800 dark:text-white">Productos de la orden</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Traer carga cabecera y detalle de la orden autorizada. Puede ajustar cantidades pendientes,
          descuentos, almacén, fecha y observación sin perder los datos cargados.
        </p>
        {lines.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Seleccione una orden y pulse Traer para cargar los productos.
          </p>
        ) : (
          lines.map((line, index) => (
            <div
              key={line.medicamento_id}
              className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 p-4 dark:border-white/[0.05] md:grid-cols-5"
            >
              <div className="md:col-span-2">
                <Label>Producto</Label>
                <InputField
                  type="text"
                  value={`${line.producto_codigo ? `${line.producto_codigo} — ` : ""}${line.producto_nombre || ""}`}
                  disabled
                />
              </div>
              <div>
                <Label>Pendiente</Label>
                <InputField type="text" value={String(line.cantidad_pendiente)} disabled />
              </div>
              <div>
                <Label>Cantidad a ingresar</Label>
                <InputField
                  type="number"
                  value={String(line.cantidad)}
                  onChange={(e) => updateLine(index, { cantidad: Number(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Precio</Label>
                <InputField type="text" value={formatMoney(line.precio)} disabled />
              </div>
              <div>
                <Label>Desc. línea</Label>
                <InputField
                  type="number"
                  value={String(line.descuento ?? 0)}
                  onChange={(e) => updateLine(index, { descuento: Number(e.target.value) || 0 })}
                />
              </div>
              <div className="md:col-span-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Subtotal:{" "}
                  {formatMoney(Math.max((line.cantidad || 0) * (line.precio || 0) - (line.descuento || 0), 0))}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="rounded-xl bg-gray-50 p-4 text-sm dark:bg-white/[0.03]">
        <p>Unidades: {preview.unidades}</p>
        <p>Suma de líneas: {formatMoney(preview.suma)}</p>
        <p>Descuento general: {formatMoney(descuento)}</p>
        <p className="font-semibold text-gray-800 dark:text-white">Monto total: {formatMoney(preview.total)}</p>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => navigate(INGRESO_PRODUCTO_ROUTES.list)}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Registrar ingreso"}
        </Button>
      </div>
    </form>
  );
}
