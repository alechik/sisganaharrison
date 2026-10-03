import { Link } from "react-router-dom";

import {
  BoxIcon,
  CalenderIcon,
  CheckCircleIcon,
  DollarLineIcon,
  FileIcon,
  HeartIcon,
  InfoIcon,
  ListIcon,
  PencilIcon,
  ShootingStarIcon,
  TaskIcon,
  TimeIcon,
} from "@/icons";
import { EVENTO_SANITARIO_ROUTES } from "@/modules/eventos-sanitarios/constants";
import { GESTACION_ROUTES } from "@/modules/gestaciones/constants";
import { NACIMIENTO_ROUTES } from "@/modules/nacimientos/constants";
import { PARTO_ROUTES } from "@/modules/partos/constants";
import { PESAJE_ROUTES } from "@/modules/pesajes/constants";
import { SALIDA_ROUTES } from "@/modules/salidas/constants";
import { SERVICIO_REPRODUCTIVO_ROUTES } from "@/modules/servicios-reproductivos/constants";
import { TRASPASO_ROUTES } from "@/modules/traspasos/constants";
import { VENTA_ROUTES } from "@/modules/ventas/constants";
import { INGRESO_ROUTES } from "@/modules/compras/constants";
import { ANIMAL_HISTORIAL_TIPOS, AnimalHistorialItem, AnimalHistorialTipo } from "../types";
import { useAnimalHistorial } from "../hooks";

const TIPO_LABELS: Record<AnimalHistorialTipo, string> = {
  INGRESO: "Ingreso",
  NACIMIENTO: "Nacimiento",
  PESAJE: "Pesaje",
  SANITARIO: "Sanitario",
  SERVICIO: "Servicio",
  GESTACION: "Gestación",
  PARTO: "Parto",
  TRASPASO: "Traspaso",
  VENTA_RESERVA: "Reserva venta",
  LIBERACION_VENTA: "Liberación",
  SALIDA: "Salida",
  OTRO: "Otro",
};

const TIPO_STYLES: Record<AnimalHistorialTipo, string> = {
  INGRESO: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  NACIMIENTO: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  PESAJE: "bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
  SANITARIO: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  SERVICIO: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  GESTACION: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  PARTO: "bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300",
  TRASPASO: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  VENTA_RESERVA: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  LIBERACION_VENTA: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  SALIDA: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  OTRO: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300",
};

const TIPO_ICONS: Record<AnimalHistorialTipo, typeof BoxIcon> = {
  INGRESO: BoxIcon,
  NACIMIENTO: HeartIcon,
  PESAJE: TaskIcon,
  SANITARIO: ShootingStarIcon,
  SERVICIO: PencilIcon,
  GESTACION: HeartIcon,
  PARTO: CheckCircleIcon,
  TRASPASO: ListIcon,
  VENTA_RESERVA: DollarLineIcon,
  LIBERACION_VENTA: TimeIcon,
  SALIDA: FileIcon,
  OTRO: InfoIcon,
};

interface Props {
  animalId: number;
  showFilters?: boolean;
  perPage?: number;
  initialTipos?: AnimalHistorialTipo[];
}

const referenciaHref = (item: AnimalHistorialItem): string | null => {
  const { modulo, id } = item.referencia;
  switch (modulo) {
    case "ingresos":
      return INGRESO_ROUTES.detail(id);
    case "nacimientos":
      return NACIMIENTO_ROUTES.detail(id);
    case "pesajes":
      return PESAJE_ROUTES.detail(id);
    case "eventos-sanitarios":
      return EVENTO_SANITARIO_ROUTES.detail(id);
    case "servicios-reproductivos":
      return SERVICIO_REPRODUCTIVO_ROUTES.detail(id);
    case "gestaciones":
      return GESTACION_ROUTES.detail(id);
    case "partos":
      return PARTO_ROUTES.detail(id);
    case "traspasos":
      return TRASPASO_ROUTES.detail(id);
    case "ventas":
      return VENTA_ROUTES.detail(id);
    case "salidas":
      return SALIDA_ROUTES.detail(id);
    default:
      return null;
  }
};

export default function AnimalTimeline({
  animalId,
  showFilters = true,
  perPage = 50,
  initialTipos,
}: Props) {
  const {
    items,
    tipos,
    loading,
    loadingMore,
    error,
    hasMore,
    toggleTipo,
    clearTipos,
    loadMore,
  } = useAnimalHistorial({ animalId, initialTipos, perPage });

  if (loading && items.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Cargando historial...</p>;
  }

  if (error && items.length === 0) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex flex-wrap gap-2">
          {ANIMAL_HISTORIAL_TIPOS.map((tipo) => {
            const active = tipos.includes(tipo);
            return (
              <button
                key={tipo}
                type="button"
                onClick={() => toggleTipo(tipo)}
                className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition ${
                  active
                    ? TIPO_STYLES[tipo]
                    : "bg-white text-gray-600 ring-gray-200 hover:bg-gray-50 dark:bg-transparent dark:text-gray-400 dark:ring-white/10 dark:hover:bg-white/5"
                }`}
              >
                {TIPO_LABELS[tipo]}
              </button>
            );
          })}
          {tipos.length > 0 && (
            <button
              type="button"
              onClick={clearTipos}
              className="rounded-full px-3 py-1 text-xs text-gray-500 underline dark:text-gray-400"
            >
              Limpiar
            </button>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No hay eventos registrados para este animal.
        </p>
      ) : (
        <ol className="relative space-y-4 border-l border-gray-200 pl-6 dark:border-white/10">
          {items.map((item) => {
            const Icon = TIPO_ICONS[item.tipo] ?? InfoIcon;
            const href = referenciaHref(item);
            return (
              <li key={item.id} className="relative">
                <span
                  className={`absolute -left-[34px] flex h-8 w-8 items-center justify-center rounded-full ${TIPO_STYLES[item.tipo]}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/[0.06] dark:bg-white/[0.03]">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${TIPO_STYLES[item.tipo]}`}>
                      {TIPO_LABELS[item.tipo]}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <CalenderIcon className="h-3.5 w-3.5" />
                      {item.fecha
                        ? new Date(`${item.fecha}T00:00:00`).toLocaleDateString("es-BO")
                        : "Sin fecha"}
                    </span>
                  </div>
                  <p className="font-medium text-gray-800 dark:text-white/90">{item.titulo}</p>
                  {item.descripcion && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.descripcion}</p>
                  )}
                  {href && (
                    <Link
                      to={href}
                      className="mt-2 inline-block text-sm text-brand-600 hover:underline dark:text-brand-400"
                    >
                      Ver registro
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loadingMore}
          className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-60 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700"
        >
          {loadingMore ? "Cargando..." : "Cargar más"}
        </button>
      )}
    </div>
  );
}
