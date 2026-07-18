import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { NacimientoFiltersBar, NacimientoTable, NacimientoToolbar } from "../components";
import { useNacimientos } from "../hooks";

export default function NacimientoListPage() {
  const { nacimientos, loading, error, meta, filters, successMessage, setPage, updateFilters, clearSuccess } =
    useNacimientos();

  if (loading && nacimientos.length === 0) {
    return <div>Cargando nacimientos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Nacimientos</h1>
          <PageBreadCrumb pageTitle="Nacimientos" items={breadcrumbs.nacimientos} />
        </div>
        <NacimientoToolbar />
      </div>
      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
          <button type="button" className="ml-3 underline" onClick={clearSuccess}>Cerrar</button>
        </div>
      )}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      <NacimientoFiltersBar filters={filters} onChange={updateFilters} />
      <NacimientoTable nacimientos={nacimientos} meta={meta} onPageChange={setPage} />
    </div>
  );
}
