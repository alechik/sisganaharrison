import { useState } from "react";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { SalidaFiltersBar, SalidaTable, SalidaToolbar } from "../components";
import { useSalidas } from "../hooks";
import { downloadSalidaPdf } from "../services";
import { Salida } from "../types";

export default function SalidaListPage() {
  const { salidas, loading, error, meta, filters, setPage, updateFilters } = useSalidas();
  const [pdfError, setPdfError] = useState<string | null>(null);

  const handlePdf = async (salida: Salida) => {
    try {
      setPdfError(null);
      await downloadSalidaPdf(salida.id, salida.codigo);
    } catch (err) {
      console.error(err);
      setPdfError("No se pudo generar el PDF.");
    }
  };

  if (loading && salidas.length === 0) {
    return <div>Cargando salidas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Salidas</h1>
          <PageBreadCrumb pageTitle="Salidas" items={breadcrumbs.salidas} />
          <p className="mt-1 text-sm text-gray-500">
            Confirma la baja del inventario. Una venta autorizada puede liquidarse como salida de tipo Venta.
          </p>
        </div>
        <SalidaToolbar />
      </div>

      {(error || pdfError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error || pdfError}
        </div>
      )}

      <SalidaFiltersBar filters={filters} onChange={updateFilters} />
      <SalidaTable salidas={salidas} meta={meta} onPageChange={setPage} onDownloadPdf={handlePdf} />
    </div>
  );
}
