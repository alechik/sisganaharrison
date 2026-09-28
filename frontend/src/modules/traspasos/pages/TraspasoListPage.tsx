import { useState } from "react";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { TraspasoFiltersBar, TraspasoTable, TraspasoToolbar } from "../components";
import { useTraspasos } from "../hooks";
import { downloadTraspasoPdf } from "../services";
import { Traspaso } from "../types";

export default function TraspasoListPage() {
  const { traspasos, loading, error, meta, filters, setPage, updateFilters } = useTraspasos();
  const [pdfError, setPdfError] = useState<string | null>(null);

  const handlePdf = async (traspaso: Traspaso) => {
    try {
      setPdfError(null);
      await downloadTraspasoPdf(traspaso.id);
    } catch (err) {
      console.error(err);
      setPdfError("No se pudo generar el PDF.");
    }
  };

  if (loading && traspasos.length === 0) {
    return <div>Cargando traspasos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Traspasos</h1>
          <PageBreadCrumb pageTitle="Traspasos" items={breadcrumbs.traspasos} />
          <p className="mt-1 text-sm text-gray-500">
            Traslada uno o más animales de un lote de salida a un lote de ingreso.
          </p>
        </div>
        <TraspasoToolbar />
      </div>

      {(error || pdfError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error || pdfError}
        </div>
      )}

      <TraspasoFiltersBar filters={filters} onChange={updateFilters} />
      <TraspasoTable traspasos={traspasos} meta={meta} onPageChange={setPage} onDownloadPdf={handlePdf} />
    </div>
  );
}
