import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { EVENTO_SANITARIO_ROUTES } from "../constants";
import { getEventoSanitario } from "../services";
import { EventoSanitario } from "../types";
import { formatAnimalLabel } from "../utils";

export default function EventoSanitarioDetailPage() {
  const { id } = useParams();
  const eventoId = Number(id);

  const [evento, setEvento] = useState<EventoSanitario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvento = async () => {
      try {
        const data = await getEventoSanitario(eventoId);
        setEvento(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle del evento sanitario.");
      } finally {
        setLoading(false);
      }
    };

    if (eventoId) {
      loadEvento();
    }
  }, [eventoId]);

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !evento) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Evento sanitario no encontrado."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb
          pageTitle={`Evento #${evento.id}`}
          items={breadcrumbs.eventoSanitarioDetalle}
        />
        <div className="flex gap-3">
          <Link
            to={EVENTO_SANITARIO_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
        </div>
      </div>

      <ComponentCard title="Detalle de Evento Sanitario">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Animal (código)</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {evento.animal_codigo || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Animal (arete)</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {evento.animal_arete || "Sin arete"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Identificación del animal</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {formatAnimalLabel(evento.animal_codigo, evento.animal_arete)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Tipo de evento</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {evento.tipo_evento_nombre || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Vacuna</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {evento.vacuna_nombre || "No aplica"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {evento.fecha
                ? new Date(`${evento.fecha}T00:00:00`).toLocaleDateString("es-PY")
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de registro</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {evento.created_at
                ? new Date(evento.created_at).toLocaleString("es-PY")
                : "—"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Diagnóstico</dt>
            <dd className="mt-1 text-gray-700 dark:text-gray-300">
              {evento.diagnostico || "Sin diagnóstico"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Tratamiento</dt>
            <dd className="mt-1 text-gray-700 dark:text-gray-300">
              {evento.tratamiento || "Sin tratamiento"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Observaciones</dt>
            <dd className="mt-1 text-gray-700 dark:text-gray-300">
              {evento.observaciones || "Sin observaciones"}
            </dd>
          </div>
        </dl>
      </ComponentCard>
    </div>
  );
}
