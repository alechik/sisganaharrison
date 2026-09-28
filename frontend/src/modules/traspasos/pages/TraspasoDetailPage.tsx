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
import { TRASPASO_ROUTES } from "../constants";
import { TRASPASOS_PERMISSIONS } from "../permissions";
import { downloadTraspasoPdf, getTraspaso, viewTraspasoPdf } from "../services";
import { Traspaso } from "../types";
import { formatDate, formatMoney, formatPeso, formatSexo, loteLabel } from "../utils";

export default function TraspasoDetailPage() {
  const { id } = useParams();
  const traspasoId = Number(id);
  const [traspaso, setTraspaso] = useState<Traspaso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setTraspaso(await getTraspaso(traspasoId));
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle del traspaso.");
      } finally {
        setLoading(false);
      }
    };

    if (traspasoId) {
      load();
    }
  }, [traspasoId]);

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !traspaso) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Traspaso no encontrado."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb pageTitle={`Traspaso #${traspaso.id}`} items={breadcrumbs.traspasoDetalle} />
        <div className="flex flex-wrap gap-3">
          <Link
            to={TRASPASO_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300"
          >
            Volver al listado
          </Link>
          <PermissionGate permission={TRASPASOS_PERMISSIONS.update}>
            <Link
              to={TRASPASO_ROUTES.edit(traspaso.id)}
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300"
            >
              Editar
            </Link>
          </PermissionGate>
          <button
            type="button"
            onClick={() => viewTraspasoPdf(traspaso.id)}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300"
          >
            Ver / imprimir PDF
          </button>
          <button
            type="button"
            onClick={() => downloadTraspasoPdf(traspaso.id)}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300"
          >
            Descargar PDF
          </button>
        </div>
      </div>

      <ComponentCard title="Cabecera del traspaso">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm text-gray-500">ID</dt>
            <dd className="font-medium">{traspaso.id}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Fecha</dt>
            <dd className="font-medium">{formatDate(traspaso.fecha_traspaso)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Lote de salida</dt>
            <dd className="font-medium">{loteLabel(traspaso.lote_salida_codigo, traspaso.lote_salida_nombre)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Lote de ingreso</dt>
            <dd className="font-medium">{loteLabel(traspaso.lote_ingreso_codigo, traspaso.lote_ingreso_nombre)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Cantidad de animales</dt>
            <dd className="font-medium">{traspaso.cantidad_animales ?? traspaso.detalles?.length ?? 0}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Total peso</dt>
            <dd className="font-medium">{formatPeso(traspaso.total_peso)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Monto total</dt>
            <dd className="font-medium">{formatMoney(traspaso.monto_total)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Usuario</dt>
            <dd className="font-medium">{traspaso.usuario_nombre || "—"}</dd>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <dt className="text-sm text-gray-500">Observación</dt>
            <dd className="mt-1 text-gray-700 dark:text-gray-300">{traspaso.observacion || "Sin observación"}</dd>
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
              <TableCell isHeader className="px-4 py-3 font-semibold">Cantidad</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Peso</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Precio/kg</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Subtotal</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(traspaso.detalles ?? []).map((detalle) => (
              <TableRow key={detalle.id}>
                <TableCell className="px-4 py-3">{detalle.animal_codigo || "—"}</TableCell>
                <TableCell className="px-4 py-3">{detalle.animal_arete || "—"}</TableCell>
                <TableCell className="px-4 py-3">{formatSexo(detalle.sexo)}</TableCell>
                <TableCell className="px-4 py-3">
                  {detalle.categoria_codigo
                    ? `${detalle.categoria_codigo} — ${detalle.categoria_nombre ?? ""}`
                    : detalle.categoria_nombre || "—"}
                </TableCell>
                <TableCell className="px-4 py-3">{detalle.cantidad}</TableCell>
                <TableCell className="px-4 py-3">{formatPeso(detalle.peso)}</TableCell>
                <TableCell className="px-4 py-3">{formatMoney(detalle.precio)}</TableCell>
                <TableCell className="px-4 py-3">{formatMoney(detalle.subtotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ComponentCard>
    </div>
  );
}
