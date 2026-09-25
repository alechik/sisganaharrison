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
import { SalidaStatusBadge } from "../components";
import { SALIDA_ROUTES } from "../constants";
import { downloadSalidaPdf, getSalida, viewSalidaPdf } from "../services";
import { Salida } from "../types";
import { formatDate, formatMoney, formatPeso, formatSexo } from "../utils";

export default function SalidaDetailPage() {
  const { id } = useParams();
  const salidaId = Number(id);
  const [salida, setSalida] = useState<Salida | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setSalida(await getSalida(salidaId));
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle de la salida.");
      } finally {
        setLoading(false);
      }
    };

    if (salidaId) {
      load();
    }
  }, [salidaId]);

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !salida) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Salida no encontrada."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb pageTitle={salida.codigo} items={breadcrumbs.salidaDetalle} />
        <div className="flex flex-wrap gap-3">
          <Link
            to={SALIDA_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300"
          >
            Volver al listado
          </Link>
          <button
            type="button"
            onClick={() => viewSalidaPdf(salida.id, salida.codigo)}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300"
          >
            Ver / imprimir PDF
          </button>
          <button
            type="button"
            onClick={() => downloadSalidaPdf(salida.id, salida.codigo)}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300"
          >
            Descargar PDF
          </button>
        </div>
      </div>

      <ComponentCard title="Cabecera de la salida">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm text-gray-500">Código</dt>
            <dd className="font-medium">{salida.codigo}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Tipo</dt>
            <dd className="font-medium">{salida.tipo_salida_nombre || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Fecha</dt>
            <dd className="font-medium">{formatDate(salida.fecha_salida)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Cliente</dt>
            <dd className="font-medium">{salida.cliente_razon_social || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Venta</dt>
            <dd className="font-medium">{salida.cod_venta || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Estado</dt>
            <dd className="mt-1">
              <SalidaStatusBadge estado={salida.estado} />
            </dd>
          </div>
        </dl>
      </ComponentCard>

      <ComponentCard title="Detalle de animales">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader className="px-4 py-3 font-semibold">Código</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Arete</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Sexo</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Categoría</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Potrero / Lote</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Peso</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Precio</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Subtotal</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(salida.detalles ?? []).map((detalle) => (
              <TableRow key={detalle.id}>
                <TableCell className="px-4 py-3">{detalle.animal_codigo || "—"}</TableCell>
                <TableCell className="px-4 py-3">{detalle.animal_arete || "—"}</TableCell>
                <TableCell className="px-4 py-3">{formatSexo(detalle.sexo)}</TableCell>
                <TableCell className="px-4 py-3">
                  {detalle.categoria_codigo} — {detalle.categoria_nombre}
                </TableCell>
                <TableCell className="px-4 py-3">
                  {detalle.potrero_nombre || "—"} / {detalle.lote_nombre || "—"}
                </TableCell>
                <TableCell className="px-4 py-3">{formatPeso(detalle.peso)}</TableCell>
                <TableCell className="px-4 py-3">{formatMoney(detalle.precio)}</TableCell>
                <TableCell className="px-4 py-3">{formatMoney(detalle.subtotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 space-y-1 text-sm">
          <p>Total peso: {formatPeso(salida.total_peso)}</p>
          <p className="font-semibold">Monto total: {formatMoney(salida.monto_total)}</p>
        </div>
      </ComponentCard>
    </div>
  );
}
