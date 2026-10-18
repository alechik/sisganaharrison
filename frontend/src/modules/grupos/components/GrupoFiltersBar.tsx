import DebouncedSearchField from "@/components/form/DebouncedSearchField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { GRUPO_SORT_OPTIONS } from "../constants";
import { useActiveLoteOptions } from "../hooks";
import { GrupoFilters, GrupoSortDirection } from "../types";

export default function GrupoFiltersBar({
  filters,
  onChange,
}: { filters: GrupoFilters; onChange: (partial: Partial<GrupoFilters>) => void }) {
  const { options: loteOptions, loading } = useActiveLoteOptions();

  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:grid-cols-2 xl:grid-cols-5">
      <div>
        <Label>Búsqueda</Label>
        <DebouncedSearchField placeholder="Nombre u observaciones" value={filters.search ?? ""} onValueChange={(search) => onChange({ search })} />
      </div>
      <div>
        <Label>Potrero</Label>
        <Select
          value={filters.lote_id ? String(filters.lote_id) : "all"}
          placeholder={loading ? "Cargando..." : "Todos"}
          options={[{ value: "all", label: "Todos" }, ...loteOptions]}
          onChange={(value) => onChange({ lote_id: value === "all" ? undefined : Number(value) })}
        />
      </div>
      <div>
        <Label>Estado</Label>
        <Select
          value={filters.activo === undefined ? "all" : filters.activo ? "true" : "false"}
          options={[
            { value: "all", label: "Todos" },
            { value: "true", label: "Activos" },
            { value: "false", label: "Inactivos" },
          ]}
          onChange={(value) => onChange({ activo: value === "all" ? undefined : value === "true" })}
        />
      </div>
      <div>
        <Label>Ordenar por</Label>
        <Select
          value={filters.sort_by}
          options={GRUPO_SORT_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
          onChange={(value) => onChange({ sort_by: value as GrupoFilters["sort_by"] })}
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
          onChange={(value) => onChange({ sort_dir: value as GrupoSortDirection })}
        />
      </div>
    </div>
  );
}
