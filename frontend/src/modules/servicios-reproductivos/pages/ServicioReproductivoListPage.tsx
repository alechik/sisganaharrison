import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import {
  ServicioReproductivoFiltersBar,
  ServicioReproductivoTable,
  ServicioReproductivoToolbar,
} from "../components";
import { useServiciosReproductivos } from "../hooks";

export default function ServicioReproductivoListPage() {
  const {
    servicios,
    loading,
    error,
    meta,
    filters,
    successMessage,
    setPage,
    updateFilters,
    clearSuccess,
  } = useServiciosReproductivos();

  if (loading && servicios.length === 0) {
    return <div>Cargando servicios reproductivos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Servicios Reproductivos
          </h1>
          <PageBreadCrumb
            pageTitle="Servicios Reproductivos"
            items={breadcrumbs.serviciosReproductivos}
          />
        </div>
        <ServicioReproductivoToolbar />
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
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <ServicioReproductivoFiltersBar filters={filters} onChange={updateFilters} />

      <ServicioReproductivoTable servicios={servicios} meta={meta} onPageChange={setPage} />
    </div>
  );
}
