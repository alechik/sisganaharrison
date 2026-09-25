import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { TIPO_SALIDA_SORT_OPTIONS } from "../constants";
import { TipoSalidaFilters, TipoSalidaSortDirection } from "../types";

interface Props {
  filters: TipoSalidaFilters;
  onChange: (partial: Partial<TipoSalidaFilters>) => void;
}

export default function TipoSalidaFiltersBar({ filters, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:grid-cols-2 xl:grid-cols-3">
      <div>
        <Label>Búsqueda</Label>
        <InputField
          type="text"
          placeholder="Nombre"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      <div>
        <Label>Ordenar por</Label>
        <Select
          value={filters.sort_by}
          options={TIPO_SALIDA_SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={(value) =>
            onChange({ sort_by: value as TipoSalidaFilters["sort_by"] })
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
            onChange({ sort_dir: value as TipoSalidaSortDirection })
          }
        />
      </div>
    </div>
  );
}
