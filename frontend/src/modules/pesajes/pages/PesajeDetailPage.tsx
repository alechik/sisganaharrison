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
import { PESAJE_ROUTES } from "../constants";
import { getPesaje } from "../services";
import { Pesaje } from "../types";
import { formatAnimalLabel, formatPeso } from "../utils";

export default function PesajeDetailPage() {
  const { id } = useParams();
  const pesajeId = Number(id);

  const [pesaje, setPesaje] = useState<Pesaje | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPesaje = async () => {
      try {
        const data = await getPesaje(pesajeId);
        setPesaje(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle del pesaje.");
      } finally {
        setLoading(false);
      }
    };

    if (pesajeId) {
      loadPesaje();
    }
  }, [pesajeId]);

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !pesaje) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Pesaje no encontrado."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb
          pageTitle={pesaje.codigo_pesaje}
          items={breadcrumbs.pesajeDetalle}
        />
        <div className="flex gap-3">
          <Link
            to={PESAJE_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
        </div>
      </div>

      <ComponentCard title="Cabecera de pesaje">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Código</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{pesaje.codigo_pesaje}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {pesaje.fecha_pesaje
                ? new Date(`${pesaje.fecha_pesaje}T00:00:00`).toLocaleDateString("es-PY")
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Total peso</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{formatPeso(pesaje.total_peso)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Usuario</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{pesaje.usuario_nombre || "—"}</dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Observación</dt>
            <dd className="mt-1 text-gray-700 dark:text-gray-300">
              {pesaje.observacion || "Sin observación"}
            </dd>
          </div>
        </dl>
      </ComponentCard>

      <ComponentCard title="Animales">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader className="px-4 py-3 font-semibold">Animal</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Lote</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Potrero</TableCell>
              <TableCell isHeader className="px-4 py-3 font-semibold">Peso</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(pesaje.detalles ?? []).map((detalle) => (
              <TableRow key={detalle.id ?? detalle.animal_id}>
                <TableCell className="px-4 py-3">
                  {formatAnimalLabel(detalle.animal_codigo, detalle.animal_arete)}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500">{detalle.lote_nombre || "—"}</TableCell>
                <TableCell className="px-4 py-3 text-gray-500">{detalle.potrero_nombre || "—"}</TableCell>
                <TableCell className="px-4 py-3">{formatPeso(detalle.peso)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ComponentCard>
    </div>
  );
}
