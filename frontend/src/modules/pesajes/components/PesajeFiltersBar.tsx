import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { PESAJE_SORT_OPTIONS } from "../constants";
import { useActiveAnimalOptions } from "../hooks";
import { PesajeFilters, PesajeSortDirection } from "../types";

interface Props {
  filters: PesajeFilters;
  onChange: (partial: Partial<PesajeFilters>) => void;
}

export default function PesajeFiltersBar({ filters, onChange }: Props) {
  const { animalOptions } = useActiveAnimalOptions();

  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <div>
        <Label>Búsqueda</Label>
        <InputField
          type="text"
          placeholder="Código, arete u observaciones"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      <div>
        <Label>Animal</Label>
        <Select
          value={filters.animal_id ? String(filters.animal_id) : "all"}
          placeholder="Todos"
          options={[
            { value: "all", label: "Todos" },
            ...animalOptions,
          ]}
          onChange={(value) =>
            onChange({
              animal_id: value === "all" ? undefined : Number(value),
            })
          }
        />
      </div>

      <div>
        <Label>Fecha desde</Label>
        <InputField
          type="date"
          value={filters.fecha_desde ?? ""}
          onChange={(e) => onChange({ fecha_desde: e.target.value })}
        />
      </div>

      <div>
        <Label>Fecha hasta</Label>
        <InputField
          type="date"
          value={filters.fecha_hasta ?? ""}
          onChange={(e) => onChange({ fecha_hasta: e.target.value })}
        />
      </div>

      <div>
        <Label>Ordenar por</Label>
        <Select
          value={filters.sort_by}
          options={PESAJE_SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={(value) => onChange({ sort_by: value as PesajeFilters["sort_by"] })}
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
          onChange={(value) => onChange({ sort_dir: value as PesajeSortDirection })}
        />
      </div>
    </div>
  );
}
