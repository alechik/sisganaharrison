import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ComponentCard from "@/components/common/ComponentCard";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { getAlmacenes } from "@/modules/almacenes/services";
import { createIngresoProducto, getOrdenesProductos, traerOrdenProducto } from "../services";
import { OrdenCompraProducto, OrdenCompraProductoDetalle } from "../types";

export default function IngresoProductoCreatePage() {
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState<OrdenCompraProducto[]>([]);
  const [ordenId, setOrdenId] = useState(0);
  const [almacenId, setAlmacenId] = useState(0);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [almacenes, setAlmacenes] = useState<{ value: string; label: string }[]>([]);
  const [detalles, setDetalles] = useState<OrdenCompraProductoDetalle[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOrdenesProductos({ per_page: 50, estado: "AUTORIZADO" }).then((res) => setOrdenes(res.data.filter((o) => o.estado === "AUTORIZADO")));
    getAlmacenes({ per_page: 50, activo: true }).then((res) => setAlmacenes(res.data.map((a) => ({ value: String(a.id), label: a.nombre }))));
  }, []);

  const traer = async () => {
    if (!ordenId) return;
    try {
      const orden = await traerOrdenProducto(ordenId);
      setDetalles(orden.detalles ?? []);
    } catch { setError("Solo se pueden traer órdenes autorizadas."); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createIngresoProducto({
        orden_compra_id: ordenId,
        almacen_id: almacenId,
        fecha,
        detalles: detalles.map((d) => ({ medicamento_id: d.medicamento_id, cantidad: d.cantidad, precio: d.precio, descuento: d.descuento })),
      });
      navigate(`/compras-productos/ingresos/${res.data.id}`);
    } catch { setError("No se pudo registrar el ingreso."); }
  };

  return (
    <ComponentCard title="Ingreso de productos">
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <Label>Orden autorizada</Label>
            <Select value={ordenId ? String(ordenId) : ""} options={ordenes.map((o) => ({ value: String(o.id), label: `${o.cod_compra} — ${o.proveedor_razon_social}` }))} onChange={(v) => setOrdenId(Number(v))} />
          </div>
          <div className="flex items-end"><Button type="button" size="sm" onClick={traer}>Traer</Button></div>
          <div><Label>Almacén</Label><Select value={almacenId ? String(almacenId) : ""} options={almacenes} onChange={(v) => setAlmacenId(Number(v))} /></div>
        </div>
        <div><Label>Fecha</Label><InputField type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></div>
        <table className="min-w-full text-sm">
          <thead><tr><th className="px-3 py-2 text-left">Producto</th><th className="px-3 py-2">Cantidad</th><th className="px-3 py-2">Precio</th></tr></thead>
          <tbody>
            {detalles.map((d, i) => (
              <tr key={d.medicamento_id}>
                <td className="px-3 py-2">{d.producto_nombre}</td>
                <td className="px-3 py-2"><InputField type="number" value={String(d.cantidad)} onChange={(e) => setDetalles((c) => c.map((x, idx) => idx === i ? { ...x, cantidad: Number(e.target.value) } : x))} /></td>
                <td className="px-3 py-2">{d.precio}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button size="sm" type="submit">Confirmar ingreso</Button>
      </form>
    </ComponentCard>
  );
}
