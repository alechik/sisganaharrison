import { useEffect, useState } from "react";

import DebouncedSearchField from "@/components/form/DebouncedSearchField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { getEstablecimientos } from "@/modules/establecimientos/services";
import { ALMACEN_SORT_OPTIONS } from "../constants";
import { AlmacenFilters, AlmacenSortDirection } from "../types";

interface Props {
  filters: AlmacenFilters;
  onChange: (partial: Partial<AlmacenFilters>) => void;
}

export default function AlmacenFiltersBar({ filters, onChange }: Props) {
  const [estancias, setEstancias] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    getEstablecimientos({ per_page: 100, sort_by: "nombre", sort_dir: "asc" })
      .then((res) => setEstancias(res.data.map((item) => ({ value: String(item.id), label: item.nombre }))))
      .catch(console.error);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:grid-cols-2 xl:grid-cols-4">
      <div>
        <Label>Búsqueda</Label>
        <DebouncedSearchField
          placeholder="Nombre o estancia"
          value={filters.search ?? ""}
          onValueChange={(search) => onChange({ search })}
        />
      </div>

      <div>
        <Label>Estancia</Label>
        <Select
          value={filters.establecimiento_id ? String(filters.establecimiento_id) : "all"}
          placeholder="Todas"
          options={[{ value: "all", label: "Todas" }, ...estancias]}
          onChange={(value) =>
            onChange({
              establecimiento_id: value === "all" ? undefined : Number(value),
            })
          }
        />
      </div>

      <div>
        <Label>Estado</Label>
        <Select
          value={filters.activo === undefined ? "all" : filters.activo ? "true" : "false"}
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
          options={ALMACEN_SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={(value) => onChange({ sort_by: value as AlmacenFilters["sort_by"] })}
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
          onChange={(value) => onChange({ sort_dir: value as AlmacenSortDirection })}
        />
      </div>
    </div>
  );
}
