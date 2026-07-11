import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { LOTE_SORT_OPTIONS } from "../constants";
import { useActivePotreroOptions } from "../hooks";
import { LoteFilters, LoteSortDirection } from "../types";

interface Props {
  filters: LoteFilters;
  onChange: (partial: Partial<LoteFilters>) => void;
}

export default function LoteFiltersBar({ filters, onChange }: Props) {
  const { options: potreroOptions, loading: loadingPotreros } =
    useActivePotreroOptions();

  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:grid-cols-2 xl:grid-cols-5">
      <div>
        <Label>Búsqueda</Label>
        <InputField
          type="text"
          placeholder="Nombre, código u observaciones"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      <div>
        <Label>Potrero</Label>
        <Select
          value={filters.potrero_id ? String(filters.potrero_id) : "all"}
          placeholder={loadingPotreros ? "Cargando..." : "Todos"}
          options={[
            { value: "all", label: "Todos" },
            ...potreroOptions,
          ]}
          onChange={(value) =>
            onChange({
              potrero_id: value === "all" ? undefined : Number(value),
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
          options={LOTE_SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={(value) =>
            onChange({ sort_by: value as LoteFilters["sort_by"] })
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
            onChange({ sort_dir: value as LoteSortDirection })
          }
        />
      </div>
    </div>
  );
}
