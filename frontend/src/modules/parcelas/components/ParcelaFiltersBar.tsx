import DebouncedSearchField from "@/components/form/DebouncedSearchField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { PARCELA_SORT_OPTIONS } from "../constants";
import { useActiveEstanciaOptions } from "../hooks";
import { ParcelaFilters, ParcelaSortDirection } from "../types";

interface Props {
  filters: ParcelaFilters;
  onChange: (partial: Partial<ParcelaFilters>) => void;
}

export default function ParcelaFiltersBar({ filters, onChange }: Props) {
  const { options: estanciaOptions, loading: loadingEstancias } =
    useActiveEstanciaOptions();

  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:grid-cols-2 xl:grid-cols-5">
      <div>
        <Label>Búsqueda</Label>
        <DebouncedSearchField
          placeholder="Nombre, código o pasto"
          value={filters.search ?? ""}
          onValueChange={(search) => onChange({ search })}
        />
      </div>

      <div>
        <Label>Estancia</Label>
        <Select
          value={filters.estancia_id ? String(filters.estancia_id) : "all"}
          placeholder={loadingEstancias ? "Cargando..." : "Todos"}
          options={[
            { value: "all", label: "Todos" },
            ...estanciaOptions,
          ]}
          onChange={(value) =>
            onChange({
              estancia_id: value === "all" ? undefined : Number(value),
            })
          }
        />
      </div>

      <div>
        <Label>Estado</Label>
        <Select
          value={
            filters.activo === undefined ? "all" : filters.activo ? "true" : "false"
          }
          placeholder="Todos"
          options={[
            { value: "all", label: "Todos" },
            { value: "true", label: "Activos" },
            { value: "false", label: "Inactivos" },
          ]}
          onChange={(value) =>
            onChange({
              activo: value === "all" ? undefined : value === "true",
            })
          }
        />
      </div>

      <div>
        <Label>Ordenar por</Label>
        <Select
          value={filters.sort_by}
          options={PARCELA_SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={(value) =>
            onChange({ sort_by: value as ParcelaFilters["sort_by"] })
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
            onChange({ sort_dir: value as ParcelaSortDirection })
          }
        />
      </div>
    </div>
  );
}
