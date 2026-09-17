import { useState } from "react";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { IngresoFiltersBar, IngresoTable, IngresoToolbar } from "../components";
import { useIngresos } from "../hooks";
import { downloadIngresoPdf } from "../services";
import { Ingreso } from "../types";

export default function IngresoListPage() {
  const { ingresos, loading, error, meta, filters, setPage, updateFilters } = useIngresos();
  const [pdfError, setPdfError] = useState<string | null>(null);

  const handlePdf = async (item: Ingreso) => {
    try {
      setPdfError(null);
      await downloadIngresoPdf(item.id, item.codigo);
    } catch (err) {
      console.error(err);
      setPdfError("No se pudo generar el PDF.");
    }
  };

  if (loading && ingresos.length === 0) {
    return <div>Cargando ingresos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Ingresos</h1>
          <PageBreadCrumb pageTitle="Ingresos" items={breadcrumbs.ingresos} />
          <p className="mt-1 text-sm text-gray-500">
            Tercera etapa del flujo Compras. Un ingreso solo se genera desde una cuarentena completada
            y puede ser parcial (distintas fechas o lotes).
          </p>
        </div>
        <IngresoToolbar />
      </div>

      {(error || pdfError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error || pdfError}
        </div>
      )}

      <IngresoFiltersBar filters={filters} onChange={updateFilters} />
      <IngresoTable
        ingresos={ingresos}
        meta={meta}
        onPageChange={setPage}
        onDownloadPdf={handlePdf}
      />
    </div>
  );
}
