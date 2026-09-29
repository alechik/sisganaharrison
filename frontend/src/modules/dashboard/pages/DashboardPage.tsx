import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import {
  DistributionChart,
  KpiCard,
  OccupancyTable,
  PendingList,
  RecentActivity,
  WeightTrendChart,
} from "../components";
import { useDashboard } from "../hooks";

const formatPct = (value: number | null) => (value === null ? "—" : `${value}%`);

export default function DashboardPage() {
  const { data, loading, error } = useDashboard();

  return (
    <>
      <PageMeta
        title="Dashboard | Agropecuaria Harrison"
        description="Resumen operativo del hato, sanidad, reproducción y movimientos"
      />
      <PageBreadCrumb pageTitle="Dashboard" />

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Cargando indicadores…</p>
      ) : null}

      {error ? (
        <p className="text-sm text-error-600 dark:text-error-500">{error}</p>
      ) : null}

      {data ? (
        <div className="space-y-6">
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Resumen general
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5 md:gap-6">
              <KpiCard
                label="Hato actual"
                value={data.kpis.hato_actual}
                hint="Excluye vendidos y muertos"
              />
              <KpiCard label="Activos" value={data.kpis.animales_activos} />
              <KpiCard label="Enfermos" value={data.kpis.animales_enfermos} />
              <KpiCard
                label="Ocupación de lotes"
                value={formatPct(data.kpis.ocupacion_lotes_pct)}
                hint={`${data.infraestructura.ocupacion_total} / ${data.infraestructura.capacidad_total}`}
              />
              <KpiCard label="Gestaciones activas" value={data.kpis.gestaciones_activas} />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
              <KpiCard label="Establecimientos" value={data.kpis.establecimientos} />
              <KpiCard label="Potreros" value={data.kpis.potreros} />
              <KpiCard label="Lotes activos" value={data.kpis.lotes} />
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Núcleo ganadero
            </h2>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 md:gap-6">
              <ComponentCard title="Distribución por sexo" desc="Animales en hato actual. Unidad: cabezas.">
                <DistributionChart seriesName="Animales" items={data.nucleo.sexo} />
              </ComponentCard>
              <ComponentCard title="Por categoría" desc="Hato actual agrupado por categoría.">
                <DistributionChart seriesName="Animales" items={data.nucleo.categorias} />
              </ComponentCard>
              <ComponentCard title="Estado productivo" desc="Hato actual. Incluye animales sin estado asignado.">
                <DistributionChart seriesName="Animales" items={data.nucleo.estados_productivos} />
              </ComponentCard>
              <ComponentCard title="Estado operativo" desc="Todos los animales no eliminados.">
                <DistributionChart seriesName="Animales" items={data.nucleo.estados_operativos} />
              </ComponentCard>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Producción y evolución
            </h2>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-5 md:gap-6">
              <div className="xl:col-span-3">
                <ComponentCard
                  title="Peso promedio mensual"
                  desc={`Promedio de kg en detalle de pesajes. Sesiones (30 días): ${data.produccion.pesajes_30d}.`}
                >
                  <WeightTrendChart items={data.produccion.peso_promedio_mensual} />
                </ComponentCard>
              </div>
              <div className="xl:col-span-2">
                <ComponentCard
                  title="Ocupación de lotes"
                  desc="Cabezas en hato vs capacidad_animales. Rojo si supera capacidad."
                >
                  <OccupancyTable lotes={data.infraestructura.lotes} />
                </ComponentCard>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Sanidad y reproducción
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-6">
              <KpiCard label="Eventos sanitarios (30 d)" value={data.sanidad_reproduccion.eventos_30d} />
              <KpiCard label="Servicios pendientes" value={data.sanidad_reproduccion.servicios_pendientes} />
              <KpiCard label="Partos pendientes" value={data.sanidad_reproduccion.partos_pendientes} />
              <KpiCard
                label="Nacimientos 30 d"
                value={data.sanidad_reproduccion.nacimientos_30d_vivos}
                hint={`Muertos: ${data.sanidad_reproduccion.nacimientos_30d_muertos}`}
              />
            </div>
            <div className="mt-4">
              <ComponentCard title="Eventos sanitarios por tipo" desc="Últimos 6 meses. Unidad: eventos (cabeceras).">
                <DistributionChart
                  seriesName="Eventos"
                  items={data.sanidad_reproduccion.eventos_por_tipo}
                  horizontal={false}
                />
              </ComponentCard>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Movimientos
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6 md:gap-6">
              <KpiCard label="OC pendientes" value={data.movimientos.ordenes_pendientes} />
              <KpiCard label="Cuarentenas en proceso" value={data.movimientos.cuarentenas_en_proceso} />
              <KpiCard label="Ingresos (30 d)" value={data.movimientos.ingresos_30d} />
              <KpiCard label="Ventas pendientes" value={data.movimientos.ventas_pendientes} />
              <KpiCard label="Salidas (30 d)" value={data.movimientos.salidas_30d} />
              <KpiCard label="Traspasos (30 d)" value={data.movimientos.traspasos_30d} />
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Pendientes y actividad
            </h2>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 md:gap-6">
              <ComponentCard title="Pendientes operativos" desc="Solo se listan ítems con cantidad mayor a cero.">
                <PendingList items={data.pendientes} />
              </ComponentCard>
              <ComponentCard title="Actividad reciente" desc="Últimos ingresos, ventas, salidas, traspasos, pesajes y eventos sanitarios.">
                <RecentActivity items={data.actividad_reciente} />
              </ComponentCard>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
