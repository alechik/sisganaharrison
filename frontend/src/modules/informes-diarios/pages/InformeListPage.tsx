import { useSearchParams } from "react-router-dom";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { InformeRevisado } from "../types";
import { InformeFiltersBar, InformeTable, InformeToolbar } from "../components";
import { useInformesDiarios } from "../hooks";

export default function InformeListPage() {
  const [params] = useSearchParams();
  const revisadoParam = params.get("revisado");
  const initialRevisado: InformeRevisado | undefined =
    revisadoParam === "SI" || revisadoParam === "NO" ? revisadoParam : undefined;

  const {
    informes,
    loading,
    error,
    meta,
    filters,
    successMessage,
    setPage,
    updateFilters,
    clearSuccess,
  } = useInformesDiarios({ revisado: initialRevisado });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Informes diarios</h1>
          <PageBreadCrumb pageTitle="Informes diarios" items={breadcrumbs.informesDiarios} />
        </div>
        <InformeToolbar />
      </div>

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
          {successMessage}
          <button type="button" className="ml-3 underline" onClick={clearSuccess}>
            Cerrar
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      {loading && informes.length === 0 && !error && (
        <div className="text-sm text-gray-500 dark:text-gray-400">Cargando informes diarios...</div>
      )}

      <InformeFiltersBar filters={filters} onChange={updateFilters} />

      <InformeTable informes={informes} meta={meta} onPageChange={setPage} />
    </div>
  );
}
