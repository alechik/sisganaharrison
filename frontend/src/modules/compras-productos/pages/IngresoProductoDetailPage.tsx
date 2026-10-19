import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

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
import { INGRESO_PRODUCTO_ROUTES, ORDEN_PRODUCTO_ROUTES } from "../constants";
import { downloadIngresoProductoPdf, getIngresoProducto } from "../services";
import { IngresoProducto } from "../types";
import { formatDate, formatMoney } from "../utils";

export default function IngresoProductoDetailPage() {
  const { id } = useParams();
  const ingresoId = Number(id);
  const [item, setItem] = useState<IngresoProducto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setItem(await getIngresoProducto(ingresoId));
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle del ingreso de productos.");
      } finally {
        setLoading(false);
      }
    };

    if (ingresoId) {
      load();
    }
  }, [ingresoId]);

  const handlePdf = async () => {
    if (!item) {
      return;
    }
    try {
      await downloadIngresoProductoPdf(item.id, item.cod_ingreso);
    } catch (err) {
      console.error(err);
      setError("No se pudo generar el PDF.");
    }
  };

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !item) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Ingreso de productos no encontrado."}
      </div>
    );
  }

  const sumaLineas = (item.detalles ?? []).reduce((acc, line) => acc + (line.subtotal ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb pageTitle={item.cod_ingreso} items={breadcrumbs.ingresoProductoDetalle} />
        <div className="flex flex-wrap gap-3">
          <Link
            to={INGRESO_PRODUCTO_ROUTES.list}
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
        </div>
      </div>

      <ComponentCard title="Cabecera del ingreso">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Código</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{item.cod_ingreso}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de ingreso</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{formatDate(item.fecha)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Proveedor</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {item.proveedor_razon_social || "—"}
              {item.proveedor_nit ? ` · NIT ${item.proveedor_nit}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Orden de origen</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              <Link className="text-brand-500 hover:underline" to={ORDEN_PRODUCTO_ROUTES.detail(item.orden_compra_id)}>
                {item.orden_cod_compra || `OC #${item.orden_compra_id}`}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Almacén</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{item.almacen_nombre || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Usuario</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{item.creador_nombre || "—"}</dd>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Observación general</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{item.observaciones || "—"}</dd>
          </div>
        </dl>
      </ComponentCard>

      <ComponentCard title="Productos ingresados">
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
            {(item.detalles ?? []).map((detalle) => (
              <TableRow key={detalle.id ?? detalle.medicamento_id}>
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
          <p>Unidades: {item.cantidad_total ?? 0}</p>
          <p>Suma de subtotales: {formatMoney(sumaLineas)}</p>
          <p>Descuento general: {formatMoney(item.descuento)}</p>
          <p className="font-semibold text-gray-800 dark:text-white">Monto total: {formatMoney(item.monto_total)}</p>
        </div>
      </ComponentCard>
    </div>
  );
}
