import { useEffect, useState } from "react";
import PermissionGate from "@/components/auth/PermissionGate";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { breadcrumbs } from "@/config/breadcrumbs";
import { ReporteFiltersBar, ReporteResult } from "../components";
import { REPORTES_PERMISSIONS } from "../permissions";
import { useReporte } from "../hooks";
import { downloadReportePdf } from "../services";
import { ReporteFiltros } from "../types";

const fechaLocal = (fecha: Date) => {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
};

const filtrosIniciales = (): ReporteFiltros => {
  const hoy = new Date();
  return {
    tipo: "inventario",
    desde: fechaLocal(new Date(hoy.getFullYear(), hoy.getMonth(), 1)),
    hasta: fechaLocal(hoy),
    sexo: "all",
    raza_id: "all",
    categoria_id: "all",
    estado_productivo_id: "all",
    lote_id: "all",
    estado: "all",
    tipo_evento_id: "all",
    animal_id: "all",
    page: 1,
  };
};

export default function ReportePage() {
  const [filtros, setFiltros] = useState<ReporteFiltros>(filtrosIniciales);
  const [exportando, setExportando] = useState(false);
  const { reporte, loading, error, generar } = useReporte();

  useEffect(() => {
    void generar(filtrosIniciales());
    // La consulta inicial no debe repetirse al cambiar filtros.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actualizar = (partial: Partial<ReporteFiltros>) => {
    setFiltros((actual) => ({ ...actual, ...partial }));
  };

  const consultar = (page = filtros.page) => {
    const siguientes = { ...filtros, page };
    setFiltros(siguientes);
    void generar(siguientes);
  };

  const exportar = async () => {
    try {
      setExportando(true);
      await downloadReportePdf(filtros);
    } catch {
      window.alert("No se pudo exportar el PDF.");
    } finally {
      setExportando(false);
    }
  };

  return (
    <>
      <PageBreadCrumb pageTitle="Reportes" items={breadcrumbs.reportes} />
      <PermissionGate
        permission={REPORTES_PERMISSIONS.view}
        fallback={
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No tiene permiso para consultar reportes.
          </p>
        }
      >
        <div className="space-y-4">
          <ReporteFiltersBar filtros={filtros} onChange={actualizar} />
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => consultar(1)} disabled={loading}>
              {loading ? "Generando…" : "Generar reporte"}
            </Button>
            <PermissionGate permission={REPORTES_PERMISSIONS.export}>
              <Button variant="outline" onClick={() => void exportar()} disabled={exportando || loading}>
                {exportando ? "Exportando…" : "Exportar PDF"}
              </Button>
            </PermissionGate>
          </div>
          {error && <p className="text-sm text-error-500">{error}</p>}
          {reporte && (
            <ReporteResult
              reporte={reporte}
              onPageChange={(page) => consultar(page)}
            />
          )}
        </div>
      </PermissionGate>
    </>
  );
}
