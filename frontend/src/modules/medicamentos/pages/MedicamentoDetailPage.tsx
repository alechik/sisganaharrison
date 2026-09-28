import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PermissionGate from "@/components/auth/PermissionGate";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { MedicamentoStatusBadge } from "../components";
import { MEDICAMENTO_ROUTES } from "../constants";
import { MEDICAMENTOS_PERMISSIONS } from "../permissions";
import { getMedicamento } from "../services";
import { Medicamento } from "../types";

export default function MedicamentoDetailPage() {
  const { id } = useParams();
  const medicamentoId = Number(id);

  const [medicamento, setMedicamento] = useState<Medicamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMedicamento = async () => {
      try {
        const data = await getMedicamento(medicamentoId);
        setMedicamento(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle del medicamento.");
      } finally {
        setLoading(false);
      }
    };

    if (medicamentoId) {
      loadMedicamento();
    }
  }, [medicamentoId]);

  if (loading) {
    return <div>Cargando detalle...</div>;
  }

  if (error || !medicamento) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? "Medicamento no encontrada."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageBreadCrumb
          pageTitle={medicamento.nombre}
          items={breadcrumbs.medicamentoDetalle}
        />
        <div className="flex gap-3">
          <Link
            to={MEDICAMENTO_ROUTES.list}
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700"
          >
            Volver al listado
          </Link>
          <PermissionGate permission={MEDICAMENTOS_PERMISSIONS.update}>
            <Link
              to={MEDICAMENTO_ROUTES.edit(medicamento.id)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
            >
              Editar
            </Link>
          </PermissionGate>
        </div>
      </div>

      <ComponentCard title="Detalle de Medicamento">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Código</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{medicamento.codigo}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Nombre</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">{medicamento.nombre}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Presentación</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {medicamento.presentacion_descripcion || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Precio</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {medicamento.precio.toLocaleString("es-PY", { minimumFractionDigits: 2 })}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Estado</dt>
            <dd className="mt-1">
              <MedicamentoStatusBadge active={medicamento.activo} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha de creación</dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {medicamento.created_at
                ? new Date(medicamento.created_at).toLocaleString("es-PY")
                : "—"}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Descripción</dt>
            <dd className="mt-1 text-gray-700 dark:text-gray-300">
              {medicamento.descripcion || "Sin descripción"}
            </dd>
          </div>
        </dl>
      </ComponentCard>
    </div>
  );
}
