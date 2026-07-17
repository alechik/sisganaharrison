import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import {
  ESTADOS_GESTACION,
  GESTACION_SORT_OPTIONS,
} from "../constants";
import { useServicioOptions } from "../hooks";
import { GestacionFilters, GestacionSortDirection } from "../types";

interface Props {
  filters: GestacionFilters;
  onChange: (partial: Partial<GestacionFilters>) => void;
}

export default function GestacionFiltersBar({ filters, onChange }: Props) {
  const { servicioOptions } = useServicioOptions();

  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <div>
        <Label>Búsqueda</Label>
        <InputField
          type="text"
          placeholder="Hembra, macho, estado u observaciones"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      <div>
        <Label>Servicio reproductivo</Label>
        <Select
          value={filters.servicio_id ? String(filters.servicio_id) : "all"}
          placeholder="Todos"
          options={[{ value: "all", label: "Todos" }, ...servicioOptions]}
          onChange={(value) =>
            onChange({
              servicio_id: value === "all" ? undefined : Number(value),
            })
          }
        />
      </div>

      <div>
        <Label>Estado</Label>
        <Select
          value={filters.estado ?? "all"}
          placeholder="Todos"
          options={[
            { value: "all", label: "Todos" },
            ...ESTADOS_GESTACION.map((item) => ({ value: item.value, label: item.label })),
          ]}
          onChange={(value) =>
            onChange({
              estado: value === "all" ? undefined : value,
            })
          }
        />
      </div>

      <div>
        <Label>Confirmación desde</Label>
        <InputField
          type="date"
          value={filters.fecha_confirmacion_desde ?? ""}
          onChange={(e) => onChange({ fecha_confirmacion_desde: e.target.value })}
        />
      </div>

      <div>
        <Label>Confirmación hasta</Label>
        <InputField
          type="date"
          value={filters.fecha_confirmacion_hasta ?? ""}
          onChange={(e) => onChange({ fecha_confirmacion_hasta: e.target.value })}
        />
      </div>

      <div>
        <Label>Ordenar por</Label>
        <Select
          value={filters.sort_by}
          options={GESTACION_SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={(value) =>
            onChange({ sort_by: value as GestacionFilters["sort_by"] })
          }
        />
      </div>

      <div>
        <Label>Dirección</Label>
        <Select
          value={filters.sort_dir}
          options={[
            { value: "asc", label: "Ascendente" },
            { value: "desc", label: "Descendente" },
          ]}
          onChange={(value) =>
            onChange({ sort_dir: value as GestacionSortDirection })
          }
        />
      </div>
    </div>
  );
}
