import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import {
  DistributionChart,
  HerdFlowTable,
  KpiCard,
  OccupancyTable,
  PendingList,
  RecentActivity,
  WeightTrendChart,
} from "../components";
import { useDashboard } from "../hooks";
import { DashboardConsulta } from "../services";

const formatPct = (value: number | null) => (value === null ? "—" : `${value}%`);

const formatTasa = (value: number | null) => (value === null ? "No disponible" : `${value}%`);

const formatMedida = (value: number | null, unidad: string) =>
  value === null ? "Sin datos" : `${value} ${unidad}`;

type Periodo = DashboardConsulta["periodo"];

const PERIODOS: { value: Periodo; label: string }[] = [
  { value: "mes", label: "Este mes" },
  { value: "trimestre", label: "Este trimestre" },
  { value: "anio", label: "Este año" },
  { value: "rango", label: "Rango de fechas" },
];

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState<Periodo>("anio");
  const [borradorDesde, setBorradorDesde] = useState("");
  const [borradorHasta, setBorradorHasta] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [avisoRango, setAvisoRango] = useState<string | null>(null);

  const consulta: DashboardConsulta | null =
    periodo === "rango"
      ? desde && hasta
        ? { periodo, desde, hasta }
        : null
      : { periodo };

  const { data, loading, error } = useDashboard(consulta);

  const aplicarRango = () => {
    if (!borradorDesde || !borradorHasta) {
      setAvisoRango("Indique la fecha inicial y la final.");
      return;
    }
    if (borradorHasta < borradorDesde) {
      setAvisoRango("La fecha final no puede ser anterior a la inicial.");
      return;
    }
    setAvisoRango(null);
    setDesde(borradorDesde);
    setHasta(borradorHasta);
  };

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
            <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Indicadores del período
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {data.periodo.desde} al {data.periodo.hasta}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <Label>Período</Label>
                  <Select
                    options={PERIODOS}
                    value={periodo}
                    onChange={(value) => {
                      setPeriodo(value as Periodo);
                      setAvisoRango(null);
                      if (value !== "rango") {
                        setDesde("");
                        setHasta("");
                      }
                    }}
                  />
                </div>
                {periodo === "rango" ? (
                  <>
                    <div>
                      <Label>Desde</Label>
                      <Input type="date" value={borradorDesde} onChange={(event) => setBorradorDesde(event.target.value)} />
                    </div>
                    <div>
                      <Label>Hasta</Label>
                      <Input type="date" value={borradorHasta} onChange={(event) => setBorradorHasta(event.target.value)} />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={aplicarRango}>Aplicar</Button>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
            {avisoRango ? <p className="mb-4 text-sm text-error-600 dark:text-error-500">{avisoRango}</p> : null}

            <h3 className="mb-3 text-base font-medium text-gray-800 dark:text-white/90">Hato</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
              <KpiCard label="Hato actual" value={data.estrategicos.hato.hato_actual} hint="Excluye vendidos, muertos y eliminados" />
              <KpiCard
                label="Variación neta"
                value={data.estrategicos.hato.variacion_neta}
                hint="Ingresos + nacidos vivos − muertes − ventas − otras bajas"
              />
              <KpiCard
                label="Mortalidad"
                value={formatTasa(data.estrategicos.mortalidad.tasa)}
                hint={`${data.estrategicos.mortalidad.cantidad} muertes en el período`}
              />
              <KpiCard
                label="Natalidad"
                value={formatTasa(data.estrategicos.natalidad.tasa)}
                hint={`${data.estrategicos.natalidad.nacidos_vivos} nacidos vivos · crías muertas: ${data.estrategicos.natalidad.nacidos_muertos}`}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-6">
              <KpiCard label="Ingresos" value={data.estrategicos.hato.ingresos} />
              <KpiCard label="Nacimientos vivos" value={data.estrategicos.hato.nacimientos_vivos} />
              <KpiCard label="Ventas" value={data.estrategicos.hato.ventas} />
              <KpiCard
                label="Descarte"
                value={data.estrategicos.descarte.disponible ? formatTasa(data.estrategicos.descarte.tasa) : "No disponible"}
                hint={data.estrategicos.descarte.motivo}
              />
            </div>
            <div className="mt-4">
              <ComponentCard title="Evolución de altas y bajas" desc={data.estrategicos.hato.formula}>
                <HerdFlowTable items={data.estrategicos.hato.serie} />
              </ComponentCard>
            </div>

            <h3 className="mb-3 mt-6 text-base font-medium text-gray-800 dark:text-white/90">Reproducción</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-6">
              <KpiCard label="Gestaciones activas" value={data.estrategicos.reproduccion.gestaciones_activas} />
              <KpiCard label="Confirmadas en el período" value={data.estrategicos.reproduccion.gestaciones_confirmadas} />
              <KpiCard
                label="Próximas a parto"
                value={data.estrategicos.reproduccion.gestaciones_parto_proximo}
                hint={data.estrategicos.reproduccion.nota_parto_proximo}
              />
              <KpiCard label="Partos del período" value={data.estrategicos.reproduccion.partos} />
            </div>

            <h3 className="mb-3 mt-6 text-base font-medium text-gray-800 dark:text-white/90">Sanidad</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
              <KpiCard label="Eventos sanitarios" value={data.estrategicos.sanidad.eventos} />
              <KpiCard
                label="Cobertura sanitaria"
                value={formatTasa(data.estrategicos.sanidad.cobertura)}
                hint={`${data.estrategicos.sanidad.animales_atendidos} animales atendidos. ${data.estrategicos.sanidad.formula_cobertura}`}
              />
              <KpiCard
                label="Vacunación"
                value={
                  data.estrategicos.sanidad.vacunacion.disponible
                    ? formatTasa(data.estrategicos.sanidad.vacunacion.tasa)
                    : "No disponible"
                }
                hint={
                  data.estrategicos.sanidad.vacunacion.disponible
                    ? `${data.estrategicos.sanidad.vacunacion.animales} animales · ${data.estrategicos.sanidad.vacunacion.eventos} eventos. ${data.estrategicos.sanidad.vacunacion.nota}`
                    : data.estrategicos.sanidad.vacunacion.nota
                }
              />
            </div>

            <h3 className="mb-3 mt-6 text-base font-medium text-gray-800 dark:text-white/90">Productividad</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
              <KpiCard
                label="Peso promedio"
                value={formatMedida(data.estrategicos.productividad.peso_promedio_kg, "kg")}
                hint={`${data.estrategicos.productividad.registros_pesaje} registros de pesaje`}
              />
              <KpiCard
                label="Ganancia de peso"
                value={formatMedida(data.estrategicos.productividad.ganancia_promedio_kg, "kg")}
                hint={data.estrategicos.productividad.formula_ganancia}
              />
            </div>
          </section>

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
                label="Ocupación de potreros"
                value={formatPct(data.kpis.ocupacion_lotes_pct)}
                hint={`${data.infraestructura.ocupacion_total} / ${data.infraestructura.capacidad_total}`}
              />
              <KpiCard label="Gestaciones activas" value={data.kpis.gestaciones_activas} />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
              <KpiCard label="Estancias" value={data.kpis.establecimientos} />
              <KpiCard label="Parcelas" value={data.kpis.potreros} />
              <KpiCard label="Potreros activos" value={data.kpis.lotes} />
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
                  title="Ocupación de potreros"
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
