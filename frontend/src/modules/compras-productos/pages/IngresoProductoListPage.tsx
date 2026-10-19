import { useState } from "react";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { IngresoProductoFiltersBar, IngresoProductoTable, IngresoProductoToolbar } from "../components";
import { useIngresosProductos } from "../hooks";
import { downloadIngresoProductoPdf } from "../services";
import { IngresoProducto } from "../types";

export default function IngresoProductoListPage() {
  const { ingresos, loading, error, meta, filters, setPage, updateFilters } = useIngresosProductos();
  const [pdfError, setPdfError] = useState<string | null>(null);

  const handlePdf = async (item: IngresoProducto) => {
    try {
      setPdfError(null);
      await downloadIngresoProductoPdf(item.id, item.cod_ingreso);
    } catch (err) {
      console.error(err);
      setPdfError("No se pudo generar el PDF.");
    }
  };

  if (loading && ingresos.length === 0) {
    return <div>Cargando ingresos de productos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Ingresos de productos</h1>
          <PageBreadCrumb pageTitle="Ingresos de productos" items={breadcrumbs.ingresosProductos} />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Cada ingreso debe proceder de una orden de compra de productos autorizada. Puede ser parcial.
          </p>
        </div>
        <IngresoProductoToolbar />
      </div>

      {(error || pdfError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error || pdfError}
        </div>
      )}

      <IngresoProductoFiltersBar filters={filters} onChange={updateFilters} />
      <IngresoProductoTable
        ingresos={ingresos}
        meta={meta}
        onPageChange={setPage}
        onDownloadPdf={handlePdf}
      />
    </div>
  );
}
