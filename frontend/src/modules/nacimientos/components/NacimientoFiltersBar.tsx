import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import {
  ESTADOS_NACIMIENTO,
  NACIMIENTO_SORT_OPTIONS,
  SEXOS_NACIMIENTO,
} from "../constants";
import { usePartoOptions } from "../hooks";
import { NacimientoFilters, NacimientoSortDirection } from "../types";

interface Props {
  filters: NacimientoFilters;
  onChange: (partial: Partial<NacimientoFilters>) => void;
}

export default function NacimientoFiltersBar({ filters, onChange }: Props) {
  const { partoOptions } = usePartoOptions();

  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <div>
        <Label>Búsqueda</Label>
        <InputField
          type="text"
          placeholder="Arete, hembra, animal u observaciones"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>
      <div>
        <Label>Parto</Label>
        <Select
          value={filters.parto_id ? String(filters.parto_id) : "all"}
          placeholder="Todos"
          options={[{ value: "all", label: "Todos" }, ...partoOptions]}
          onChange={(value) =>
            onChange({ parto_id: value === "all" ? undefined : Number(value) })
          }
        />
      </div>
      <div>
        <Label>Estado</Label>
        <Select
          value={filters.estado_nacimiento ?? "all"}
          options={[
            { value: "all", label: "Todos" },
            ...ESTADOS_NACIMIENTO.map((item) => ({ value: item.value, label: item.label })),
          ]}
          onChange={(value) =>
            onChange({ estado_nacimiento: value === "all" ? undefined : value })
          }
        />
      </div>
      <div>
        <Label>Sexo</Label>
        <Select
          value={filters.sexo ?? "all"}
          options={[
            { value: "all", label: "Todos" },
            ...SEXOS_NACIMIENTO.map((item) => ({ value: item.value, label: item.label })),
          ]}
          onChange={(value) => onChange({ sexo: value === "all" ? undefined : value })}
        />
      </div>
      <div>
        <Label>Ordenar por</Label>
        <Select
          value={filters.sort_by}
          options={NACIMIENTO_SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={(value) =>
            onChange({ sort_by: value as NacimientoFilters["sort_by"] })
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
            onChange({ sort_dir: value as NacimientoSortDirection })
          }
        />
      </div>
    </div>
  );
}
