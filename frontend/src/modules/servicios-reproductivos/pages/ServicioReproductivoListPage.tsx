import { useState } from "react";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import {
  ConfirmarGestacionModal,
  RegistrarPartoNacimientoModal,
  ServicioReproductivoFiltersBar,
  ServicioReproductivoTable,
  ServicioReproductivoToolbar,
} from "../components";
import { TIPO_INSEMINACION_ARTIFICIAL, TIPO_MONTA_NATURAL } from "../constants";
import { useServiciosReproductivos } from "../hooks";
import { ServicioReproductivo } from "../types";

interface Props {
  tipoServicio: string;
}

export default function ServicioReproductivoListPage({ tipoServicio }: Props) {
  const esIa = tipoServicio === TIPO_INSEMINACION_ARTIFICIAL;
  const title = esIa ? "Inseminación Artificial" : "Monta Natural";
  const crumb = esIa
    ? breadcrumbs.serviciosReproductivosInseminacion
    : breadcrumbs.serviciosReproductivosMontaNatural;

  const {
    servicios,
    loading,
    error,
    meta,
    filters,
    successMessage,
    setPage,
    updateFilters,
    refresh,
    showSuccess,
    clearSuccess,
  } = useServiciosReproductivos({
    initialFilters: { tipo_servicio: tipoServicio },
  });

  const [servicioGestacion, setServicioGestacion] = useState<ServicioReproductivo | null>(null);
  const [servicioParto, setServicioParto] = useState<ServicioReproductivo | null>(null);

  if (loading && servicios.length === 0) {
    return <div>Cargando servicios reproductivos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h1>
          <PageBreadCrumb pageTitle={title} items={crumb} />
        </div>
        <ServicioReproductivoToolbar tipoServicio={tipoServicio} />
      </div>

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
          {successMessage}
          <button type="button" className="ml-3 underline" onClick={clearSuccess}>
            Cerrar
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <ServicioReproductivoFiltersBar
        filters={filters}
        onChange={(partial) => updateFilters({ ...partial, tipo_servicio: tipoServicio })}
        ocultarTipo
      />

      <ServicioReproductivoTable
        servicios={servicios}
        meta={meta}
        onPageChange={setPage}
        mostrarTipo={false}
        onConfirmarGestacion={setServicioGestacion}
        onRegistrarParto={setServicioParto}
      />

      <ConfirmarGestacionModal
        isOpen={Boolean(servicioGestacion)}
        servicio={servicioGestacion}
        onClose={() => setServicioGestacion(null)}
        onSaved={(message) => {
          showSuccess(message);
          refresh();
        }}
      />

      <RegistrarPartoNacimientoModal
        isOpen={Boolean(servicioParto)}
        servicio={servicioParto}
        onClose={() => setServicioParto(null)}
        onSaved={(message) => {
          showSuccess(message);
          refresh();
        }}
      />
    </div>
  );
}

export function MontaNaturalListPage() {
  return <ServicioReproductivoListPage tipoServicio={TIPO_MONTA_NATURAL} />;
}

export function InseminacionArtificialListPage() {
  return <ServicioReproductivoListPage tipoServicio={TIPO_INSEMINACION_ARTIFICIAL} />;
}
