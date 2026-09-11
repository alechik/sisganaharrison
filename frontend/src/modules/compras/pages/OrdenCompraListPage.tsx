import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { OrdenCompraFiltersBar, OrdenCompraTable, OrdenCompraToolbar } from "../components";
import { useOrdenesCompra } from "../hooks";
import { downloadOrdenCompraPdf } from "../services";
import { OrdenCompra } from "../types";

export default function OrdenCompraListPage() {
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
  } = useOrdenesCompra({
    initialFilters: { estado: estadoParam },
  });
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    if (filters.estado !== estadoParam) {
      updateFilters({ estado: estadoParam });
    }
  }, [estadoParam]);

  const handlePdf = async (orden: OrdenCompra) => {
    try {
      setPdfError(null);
      await downloadOrdenCompraPdf(orden.id, orden.cod_compra);
    } catch (err) {
      console.error(err);
      setPdfError("No se pudo generar el PDF.");
    }
  };

  if (loading && ordenes.length === 0) {
    return <div>Cargando órdenes de compra...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Órdenes de Compra</h1>
          <PageBreadCrumb pageTitle="Órdenes de Compra" items={breadcrumbs.ordenesCompra} />
          <p className="mt-1 text-sm text-gray-500">
            Primera etapa del flujo Compras. Las órdenes quedan pendientes hasta la autorización.
          </p>
        </div>
        <OrdenCompraToolbar />
      </div>

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
          <button type="button" className="ml-3 underline" onClick={clearSuccess}>
            Cerrar
          </button>
        </div>
      )}

      {(error || pdfError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error || pdfError}
        </div>
      )}

      <OrdenCompraFiltersBar filters={filters} onChange={updateFilters} />

      <OrdenCompraTable
        ordenes={ordenes}
        meta={meta}
        onPageChange={setPage}
        onDownloadPdf={handlePdf}
      />
    </div>
  );
}
