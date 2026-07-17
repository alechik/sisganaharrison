import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
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
          pageTitle={`Pesaje #${pesaje.id}`}
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

      <ComponentCard title="Detalle de Pesaje">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Animal (código)</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {pesaje.animal_codigo || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Animal (arete)</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {pesaje.animal_arete || "Sin arete"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Identificación</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {formatAnimalLabel(pesaje.animal_codigo, pesaje.animal_arete)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {pesaje.fecha
                ? new Date(`${pesaje.fecha}T00:00:00`).toLocaleDateString("es-PY")
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Peso</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {formatPeso(pesaje.peso)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de registro</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {pesaje.created_at
                ? new Date(pesaje.created_at).toLocaleString("es-PY")
                : "—"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Observaciones</dt>
            <dd className="mt-1 text-gray-700 dark:text-gray-300">
              {pesaje.observaciones || "Sin observaciones"}
            </dd>
          </div>
        </dl>
      </ComponentCard>
    </div>
  );
}
