import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { breadcrumbs } from "@/config/breadcrumbs";
import { downloadIngresoProductoPdf, getIngresoProducto } from "../services";
import { IngresoProducto } from "../types";

export default function IngresoProductoDetailPage() {
  const id = Number(useParams().id);
  const [item, setItem] = useState<IngresoProducto | null>(null);
  useEffect(() => { getIngresoProducto(id).then(setItem); }, [id]);
  if (!item) return <div>Cargando...</div>;
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <PageBreadCrumb pageTitle={item.cod_ingreso} items={breadcrumbs.ingresoProductoDetalle} />
        <Button size="sm" variant="outline" onClick={() => downloadIngresoProductoPdf(item.id, item.cod_ingreso)}>PDF</Button>
      </div>
      <ComponentCard title="Ingreso">
        <p>Orden: {item.orden_cod_compra}</p>
        <p>Almacén: {item.almacen_nombre}</p>
        <p>Total: {item.monto_total}</p>
      </ComponentCard>
      <ComponentCard title="Productos">
        <table className="min-w-full text-sm">
          <thead><tr><th className="px-3 py-2 text-left">Producto</th><th className="px-3 py-2 text-right">Cantidad</th></tr></thead>
          <tbody>
            {(item.detalles ?? []).map((d) => (
              <tr key={d.id}><td className="px-3 py-2">{d.producto_nombre}</td><td className="px-3 py-2 text-right">{d.cantidad}</td></tr>
            ))}
          </tbody>
        </table>
      </ComponentCard>
    </div>
  );
}
