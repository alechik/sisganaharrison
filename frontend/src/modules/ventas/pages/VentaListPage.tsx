import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { VentaFiltersBar, VentaTable, VentaToolbar } from "../components";
import { useDecidirVenta, useVentas } from "../hooks";
import { downloadVentaPdf } from "../services";
import { Venta } from "../types";

export default function VentaListPage() {
  const { ventas, loading, error, meta, filters, setPage, updateFilters, refresh } = useVentas();
  const { autorizar, anular, loading: deciding, error: decisionError, setError: setDecisionError } =
    useDecidirVenta();
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ type: "autorizar" | "anular"; venta: Venta } | null>(null);

  const handlePdf = async (venta: Venta) => {
    try {
      setPdfError(null);
      await downloadVentaPdf(venta.id, venta.cod_venta);
    } catch (err) {
      console.error(err);
      setPdfError("No se pudo generar el PDF.");
    }
  };

  const handleConfirm = async () => {
    if (!dialog) {
      return;
    }
    try {
      if (dialog.type === "autorizar") {
        await autorizar(dialog.venta.id);
      } else {
        await anular(dialog.venta.id);
      }
      setDialog(null);
      refresh();
    } catch {
      // handled
    }
  };

  if (loading && ventas.length === 0) {
    return <div>Cargando ventas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Ventas</h1>
          <PageBreadCrumb pageTitle="Ventas" items={breadcrumbs.ventas} />
          <p className="mt-1 text-sm text-gray-500">
            Las ventas quedan pendientes hasta la autorización de gerencia. Los animales se reservan al registrar.
          </p>
        </div>
        <VentaToolbar />
      </div>

      {(error || pdfError || decisionError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error || pdfError || decisionError}
        </div>
      )}

      <VentaFiltersBar filters={filters} onChange={updateFilters} />

      <VentaTable
        ventas={ventas}
        meta={meta}
        onPageChange={setPage}
        onDownloadPdf={handlePdf}
        onAutorizar={(venta) => {
          setDecisionError(null);
          setDialog({ type: "autorizar", venta });
        }}
        onAnular={(venta) => {
          setDecisionError(null);
          setDialog({ type: "anular", venta });
        }}
      />

      <ConfirmDialog
        isOpen={dialog !== null}
        title={dialog?.type === "autorizar" ? "Autorizar venta" : "Anular venta"}
        message={
          dialog?.type === "autorizar"
            ? `¿Autorizar ${dialog.venta.cod_venta}? Quedará bloqueada para edición. Los animales siguen reservados hasta la salida.`
            : `¿Anular ${dialog?.venta.cod_venta}? Se liberará la reserva de los animales.`
        }
        confirmLabel={dialog?.type === "autorizar" ? "Autorizar" : "Anular"}
        loading={deciding}
        onConfirm={handleConfirm}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}
