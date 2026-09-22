import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { ESTADOS_PARTO, PARTO_SORT_OPTIONS } from "../constants";
import { useGestacionOptions } from "../hooks";
import { PartoFilters, PartoSortDirection } from "../types";

interface Props {
  filters: PartoFilters;
  onChange: (partial: Partial<PartoFilters>) => void;
}

export default function PartoFiltersBar({ filters, onChange }: Props) {
  const { gestacionOptions } = useGestacionOptions();

  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <div>
        <Label>Búsqueda</Label>
        <InputField
          type="text"
          placeholder="Hembra, macho u observaciones"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      <div>
        <Label>Gestación</Label>
        <Select
          value={filters.gestacion_id ? String(filters.gestacion_id) : "all"}
          placeholder="Todas"
          options={[{ value: "all", label: "Todas" }, ...gestacionOptions]}
          onChange={(value) =>
            onChange({
              gestacion_id: value === "all" ? undefined : Number(value),
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
            ...ESTADOS_PARTO.map((option) => ({
              value: option.value,
              label: option.label,
            })),
          ]}
          onChange={(value) =>
            onChange({
              estado: value === "all" ? undefined : value,
            })
          }
        />
      </div>

      <div>
        <Label>Fecha parto desde</Label>
        <InputField
          type="date"
          value={filters.fecha_parto_desde ?? ""}
          onChange={(e) => onChange({ fecha_parto_desde: e.target.value })}
        />
      </div>

      <div>
        <Label>Fecha parto hasta</Label>
        <InputField
          type="date"
          value={filters.fecha_parto_hasta ?? ""}
          onChange={(e) => onChange({ fecha_parto_hasta: e.target.value })}
        />
      </div>

      <div>
        <Label>Ordenar por</Label>
        <Select
          value={filters.sort_by}
          options={PARTO_SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={(value) =>
            onChange({ sort_by: value as PartoFilters["sort_by"] })
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
            onChange({ sort_dir: value as PartoSortDirection })
          }
        />
      </div>
    </div>
  );
}
