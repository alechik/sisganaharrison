import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { breadcrumbs } from "@/config/breadcrumbs";
import { autorizarOrdenProducto, cancelarOrdenProducto, downloadOrdenProductoPdf, getOrdenProducto } from "../services";
import { OrdenCompraProducto } from "../types";

export default function OrdenProductoDetailPage() {
  const id = Number(useParams().id);
  const [orden, setOrden] = useState<OrdenCompraProducto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = () => getOrdenProducto(id).then(setOrden).catch(() => setError("No se pudo cargar."));
  useEffect(() => { load(); }, [id]);
  if (!orden) return <div>{error ?? "Cargando..."}</div>;
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <PageBreadCrumb pageTitle={orden.cod_compra} items={breadcrumbs.ordenProductoDetalle} />
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => downloadOrdenProductoPdf(orden.id, orden.cod_compra)}>PDF</Button>
          {orden.estado === "PENDIENTE" && (
            <PermissionGate permission="compras_productos.authorize">
              <>
                <Button size="sm" onClick={() => autorizarOrdenProducto(orden.id).then(load).catch(() => setError("No autorizado."))}>Autorizar</Button>
                <Button size="sm" variant="outline" onClick={() => cancelarOrdenProducto(orden.id).then(load).catch(() => setError("No autorizado."))}>Cancelar</Button>
              </>
            </PermissionGate>
          )}
          <Link to="/compras-productos/ordenes" className="rounded-lg bg-white px-4 py-3 text-sm ring-1 ring-gray-300">Volver</Link>
        </div>
      </div>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      <ComponentCard title="Cabecera">
        <p>Proveedor: {orden.proveedor_razon_social}</p>
        <p>Estado: {orden.estado}</p>
        <p>Total: {orden.monto_total}</p>
      </ComponentCard>
      <ComponentCard title="Detalle">
        <table className="min-w-full text-sm">
          <thead><tr><th className="px-3 py-2 text-left">Producto</th><th className="px-3 py-2 text-right">Cant.</th><th className="px-3 py-2 text-right">Precio</th><th className="px-3 py-2 text-right">Subtotal</th></tr></thead>
          <tbody>
            {(orden.detalles ?? []).map((d) => (
              <tr key={d.id}><td className="px-3 py-2">{d.producto_nombre}</td><td className="px-3 py-2 text-right">{d.cantidad}</td><td className="px-3 py-2 text-right">{d.precio}</td><td className="px-3 py-2 text-right">{d.subtotal}</td></tr>
            ))}
          </tbody>
        </table>
      </ComponentCard>
    </div>
  );
}
