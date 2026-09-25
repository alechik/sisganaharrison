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
import { IngresoStatusBadge } from "../components";
import { CUARENTENA_ROUTES, INGRESO_ROUTES } from "../constants";
import { downloadIngresoPdf, getIngreso } from "../services";
import { Ingreso } from "../types";
import { formatDate, formatEdad, formatMoney, formatPeso, formatSexo } from "../utils";

export default function IngresoDetailPage() {
  const { id } = useParams();
  const ingresoId = Number(id);
  const [item, setItem] = useState<Ingreso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setItem(await getIngreso(ingresoId));
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle del ingreso.");
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
      await downloadIngresoPdf(item.id, item.codigo);
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
        {error ?? "Ingreso no encontrado."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb pageTitle={item.codigo} items={breadcrumbs.ingresoDetalle} />
        <div className="flex flex-wrap gap-3">
          <Link
            to={INGRESO_ROUTES.list}
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
            <dt className="text-sm text-gray-500">Código</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{item.codigo}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Estado</dt>
            <dd className="mt-1">
              <IngresoStatusBadge estado={item.estado} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Fecha de ingreso</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{formatDate(item.fecha_ingreso)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Proveedor</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {item.proveedor_razon_social || "—"}
              {item.proveedor_nit ? ` · NIT ${item.proveedor_nit}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Cuarentena de origen</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              <Link className="text-brand-500 hover:underline" to={CUARENTENA_ROUTES.detail(item.cuarentena_id)}>
                {item.cuarentena_codigo || `CQ #${item.cuarentena_id}`}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Lote destino</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {item.lote_codigo ? `${item.lote_codigo} — ` : ""}
              {item.lote_nombre || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Usuario</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{item.creador_nombre || "—"}</dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500">Observación general</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{item.observaciones || "—"}</dd>
          </div>
        </dl>
      </ComponentCard>

      <ComponentCard title="Animales ingresados">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-4 py-3 font-semibold">Código</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Sexo</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Categoría</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Edad (meses)</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Peso cuarentena</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Peso ingreso</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Precio compra</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Observaciones</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(item.detalles ?? []).map((detalle) => (
              <TableRow key={detalle.id}>
                <TableCell className="px-4 py-3">{detalle.animal_codigo || "—"}</TableCell>
                <TableCell className="px-4 py-3">{formatSexo(detalle.sexo)}</TableCell>
                <TableCell className="px-4 py-3">
                  {detalle.categoria_codigo} — {detalle.categoria_nombre}
                </TableCell>
                <TableCell className="px-4 py-3">{formatEdad(detalle.edad)}</TableCell>
                <TableCell className="px-4 py-3">{formatPeso(detalle.peso_oc)}</TableCell>
                <TableCell className="px-4 py-3">{formatPeso(detalle.peso_ingreso)}</TableCell>
                <TableCell className="px-4 py-3">{formatMoney(detalle.precio_compra)}</TableCell>
                <TableCell className="px-4 py-3">{detalle.observaciones || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 space-y-1 text-sm">
          <p>Animales: {item.cantidad_total ?? item.detalles?.length ?? 0}</p>
          <p>Total peso ingreso: {formatPeso(item.total_peso)}</p>
          <p>Descuento general: {formatMoney(item.descuento)}</p>
          <p className="font-semibold">Monto total: {formatMoney(item.monto_total)}</p>
        </div>
      </ComponentCard>
    </div>
  );
}
