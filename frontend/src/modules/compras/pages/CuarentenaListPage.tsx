import { useState } from "react";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { CuarentenaFiltersBar, CuarentenaTable, CuarentenaToolbar } from "../components";
import { useCuarentenas } from "../hooks";
import { downloadCuarentenaPdf } from "../services";
import { Cuarentena } from "../types";

export default function CuarentenaListPage() {
  const { cuarentenas, loading, error, meta, filters, setPage, updateFilters } = useCuarentenas();
  const [pdfError, setPdfError] = useState<string | null>(null);

  const handlePdf = async (item: Cuarentena) => {
    try {
      setPdfError(null);
      await downloadCuarentenaPdf(item.id, item.cod_compra);
    } catch (err) {
      console.error(err);
      setPdfError("No se pudo generar el PDF.");
    }
  };

  if (loading && cuarentenas.length === 0) {
    return <div>Cargando cuarentenas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Cuarentenas</h1>
          <PageBreadCrumb pageTitle="Cuarentenas" items={breadcrumbs.cuarentenas} />
          <p className="mt-1 text-sm text-gray-500">
            Segunda etapa del flujo Compras. Puede originarse en una orden autorizada o registrarse
            como excepción directa.
          </p>
        </div>
        <CuarentenaToolbar />
      </div>

      {(error || pdfError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error || pdfError}
        </div>
      )}

      <CuarentenaFiltersBar filters={filters} onChange={updateFilters} />
      <CuarentenaTable
        cuarentenas={cuarentenas}
        meta={meta}
        onPageChange={setPage}
        onDownloadPdf={handlePdf}
      />
    </div>
  );
}
