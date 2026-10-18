import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ComponentCard from "@/components/common/ComponentCard";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { getMedicamentos } from "@/modules/medicamentos/services";
import { getSocios } from "@/modules/socios-de-negocio/services";
import { createOrdenProducto } from "../services";

export default function OrdenProductoCreatePage() {
  const navigate = useNavigate();
  const [proveedorId, setProveedorId] = useState(0);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [proveedores, setProveedores] = useState<{ value: string; label: string }[]>([]);
  const [productos, setProductos] = useState<{ id: number; nombre: string; precio: number }[]>([]);
  const [lines, setLines] = useState([{ medicamento_id: 0, cantidad: 1, precio: 0, descuento: 0 }]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSocios({ per_page: 100, tipo: "PROVEEDOR" }).then((res) =>
      setProveedores(res.data.map((p) => ({ value: String(p.id), label: p.razon_social })))
    );
    getMedicamentos({ per_page: 100, activo: true }).then((res) => setProductos(res.data.map((m) => ({ id: m.id, nombre: `${m.codigo} — ${m.nombre}`, precio: m.precio }))));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createOrdenProducto({
        proveedor_id: proveedorId,
        fecha,
        detalles: lines.filter((l) => l.medicamento_id).map((l) => ({ ...l, cantidad: Number(l.cantidad), precio: Number(l.precio), descuento: Number(l.descuento) })),
      });
      navigate(`/compras-productos/ordenes/${res.data.id}`);
    } catch { setError("No se pudo registrar la orden."); }
  };

  return (
    <ComponentCard title="Nueva orden de compra de productos">
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
        <div><Label>Proveedor</Label><Select value={proveedorId ? String(proveedorId) : ""} options={proveedores} onChange={(v) => setProveedorId(Number(v))} /></div>
        <div><Label>Fecha</Label><InputField type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></div>
        {lines.map((line, index) => (
          <div key={index} className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <Select
              value={line.medicamento_id ? String(line.medicamento_id) : ""}
              options={productos.map((p) => ({ value: String(p.id), label: p.nombre }))}
              placeholder="Producto"
              onChange={(v) => {
                const prod = productos.find((p) => p.id === Number(v));
                setLines((current) => current.map((l, i) => i === index ? { ...l, medicamento_id: Number(v), precio: prod?.precio ?? l.precio } : l));
              }}
            />
            <InputField type="number" value={String(line.cantidad)} onChange={(e) => setLines((c) => c.map((l, i) => i === index ? { ...l, cantidad: Number(e.target.value) } : l))} />
            <InputField type="number" value={String(line.precio)} onChange={(e) => setLines((c) => c.map((l, i) => i === index ? { ...l, precio: Number(e.target.value) } : l))} />
            <Button type="button" size="sm" variant="outline" onClick={() => setLines((c) => [...c, { medicamento_id: 0, cantidad: 1, precio: 0, descuento: 0 }])}>+ Línea</Button>
          </div>
        ))}
        <Button size="sm" type="submit">Guardar pendiente</Button>
      </form>
    </ComponentCard>
  );
}
