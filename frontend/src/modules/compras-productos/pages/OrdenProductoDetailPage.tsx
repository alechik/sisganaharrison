import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { breadcrumbs } from "@/config/breadcrumbs";
import { OrdenProductoDecisionCard, OrdenProductoStatusBadge } from "../components";
import { ORDEN_PRODUCTO_ROUTES } from "../constants";
import { COMPRAS_PRODUCTOS_PERMISSIONS } from "../permissions";
import { downloadOrdenProductoPdf, getOrdenProducto } from "../services";
import { OrdenCompraProducto } from "../types";
import { formatDate, formatMoney, isPendiente } from "../utils";

export default function OrdenProductoDetailPage() {
  const { id } = useParams();
  const ordenId = Number(id);
  const [orden, setOrden] = useState<OrdenCompraProducto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setOrden(await getOrdenProducto(ordenId));
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle de la orden de compra de productos.");
      } finally {
        setLoading(false);
      }
    };

    if (ordenId) {
      load();
    }
  }, [ordenId]);

  const handlePdf = async () => {
    if (!orden) {
      return;
    }
    try {
      await downloadOrdenProductoPdf(orden.id, orden.cod_compra);
    } catch (err) {
      console.error(err);
      setError("No se pudo generar el PDF.");
    }
  };

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !orden) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Orden de compra de productos no encontrada."}
      </div>
    );
  }

  const sumaLineas = (orden.detalles ?? []).reduce((acc, line) => acc + (line.subtotal ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb pageTitle={orden.cod_compra} items={breadcrumbs.ordenProductoDetalle} />
        <div className="flex flex-wrap gap-3">
          <Link
            to={ORDEN_PRODUCTO_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
          <button
            type="button"
            onClick={handlePdf}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Descargar PDF
          </button>
          {isPendiente(orden.estado) && (
            <PermissionGate permission={COMPRAS_PRODUCTOS_PERMISSIONS.update}>
              <Link
                to={ORDEN_PRODUCTO_ROUTES.edit(orden.id)}
                className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
              >
                Editar
              </Link>
            </PermissionGate>
          )}
        </div>
      </div>

      <ComponentCard title="Cabecera de la orden">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Código</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{orden.cod_compra}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{formatDate(orden.fecha)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Estado</dt>
            <dd className="mt-1">
              <OrdenProductoStatusBadge estado={orden.estado} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Proveedor</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {orden.proveedor_razon_social || "—"}
              {orden.proveedor_nit ? ` · NIT ${orden.proveedor_nit}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Usuario creador</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{orden.creador_nombre || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Autorizado / cancelado por</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{orden.autorizador_nombre || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de decisión</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {orden.fecha_decision ? new Date(orden.fecha_decision).toLocaleString("es-PY") : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Observación</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {orden.observacion_estado || "—"}
            </dd>
          </div>
        </dl>
      </ComponentCard>

      <ComponentCard title="Productos">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-4 py-3 font-semibold">Código</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Producto</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Cantidad</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Precio</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Descuento</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Subtotal</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(orden.detalles ?? []).map((detalle) => (
              <TableRow key={detalle.id}>
                <TableCell className="px-4 py-3">{detalle.producto_codigo || "—"}</TableCell>
                <TableCell className="px-4 py-3">{detalle.producto_nombre || "—"}</TableCell>
                <TableCell className="px-4 py-3">{detalle.cantidad}</TableCell>
                <TableCell className="px-4 py-3">{formatMoney(detalle.precio)}</TableCell>
                <TableCell className="px-4 py-3">{formatMoney(detalle.descuento)}</TableCell>
                <TableCell className="px-4 py-3">{formatMoney(detalle.subtotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <p>Suma de subtotales: {formatMoney(sumaLineas)}</p>
          <p>Descuento general: {formatMoney(orden.descuento)}</p>
          <p className="font-semibold text-gray-800 dark:text-white">Monto total: {formatMoney(orden.monto_total)}</p>
        </div>
      </ComponentCard>

      <OrdenProductoDecisionCard orden={orden} onDecided={setOrden} />
    </div>
  );
}
