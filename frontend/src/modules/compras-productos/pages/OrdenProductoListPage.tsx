import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { OrdenProductoFiltersBar, OrdenProductoTable, OrdenProductoToolbar } from "../components";
import { useOrdenesProductos } from "../hooks";
import { downloadOrdenProductoPdf } from "../services";
import { OrdenCompraProducto } from "../types";

export default function OrdenProductoListPage() {
  const [searchParams] = useSearchParams();
  const estadoParam = searchParams.get("estado") || undefined;
  const {
    ordenes,
    loading,
    error,
    meta,
    filters,
    successMessage,
    setPage,
    updateFilters,
    clearSuccess,
  } = useOrdenesProductos({
    initialFilters: { estado: estadoParam },
  });
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    if (filters.estado !== estadoParam) {
      updateFilters({ estado: estadoParam });
    }
  }, [estadoParam]);

  const handlePdf = async (orden: OrdenCompraProducto) => {
    try {
      setPdfError(null);
      await downloadOrdenProductoPdf(orden.id, orden.cod_compra);
    } catch (err) {
      console.error(err);
      setPdfError("No se pudo generar el PDF.");
    }
  };

  if (loading && ordenes.length === 0) {
    return <div>Cargando órdenes de compra de productos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Órdenes de compra de productos</h1>
          <PageBreadCrumb pageTitle="Órdenes de productos" items={breadcrumbs.ordenesProductos} />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Las órdenes quedan pendientes hasta que Gerencia las autorice o cancele.
          </p>
        </div>
        <OrdenProductoToolbar />
      </div>

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
          {successMessage}
          <button type="button" className="ml-3 underline" onClick={clearSuccess}>
            Cerrar
          </button>
        </div>
      )}

      {(error || pdfError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error || pdfError}
        </div>
      )}

      <OrdenProductoFiltersBar filters={filters} onChange={updateFilters} />

      <OrdenProductoTable
        ordenes={ordenes}
        meta={meta}
        onPageChange={setPage}
        onDownloadPdf={handlePdf}
      />
    </div>
  );
}
