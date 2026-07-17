import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import {
  RESULTADOS_SERVICIO,
  SERVICIO_REPRODUCTIVO_SORT_OPTIONS,
  TIPOS_SERVICIO,
} from "../constants";
import { useReproduccionAnimalOptions } from "../hooks";
import { ServicioReproductivoFilters, ServicioReproductivoSortDirection } from "../types";

interface Props {
  filters: ServicioReproductivoFilters;
  onChange: (partial: Partial<ServicioReproductivoFilters>) => void;
}

export default function ServicioReproductivoFiltersBar({ filters, onChange }: Props) {
  const { hembraOptions, machoOptions } = useReproduccionAnimalOptions();

  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <div>
        <Label>Búsqueda</Label>
        <InputField
          type="text"
          placeholder="Animal, tipo, resultado u observaciones"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      <div>
        <Label>Hembra</Label>
        <Select
          value={filters.hembra_id ? String(filters.hembra_id) : "all"}
          placeholder="Todas"
          options={[{ value: "all", label: "Todas" }, ...hembraOptions]}
          onChange={(value) =>
            onChange({
              hembra_id: value === "all" ? undefined : Number(value),
            })
          }
        />
      </div>

      <div>
        <Label>Macho</Label>
        <Select
          value={filters.macho_id ? String(filters.macho_id) : "all"}
          placeholder="Todos"
          options={[{ value: "all", label: "Todos" }, ...machoOptions]}
          onChange={(value) =>
            onChange({
              macho_id: value === "all" ? undefined : Number(value),
            })
          }
        />
      </div>

      <div>
        <Label>Tipo de servicio</Label>
        <Select
          value={filters.tipo_servicio ?? "all"}
          placeholder="Todos"
          options={[
            { value: "all", label: "Todos" },
            ...TIPOS_SERVICIO.map((item) => ({ value: item.value, label: item.label })),
          ]}
          onChange={(value) =>
            onChange({
              tipo_servicio: value === "all" ? undefined : value,
            })
          }
        />
      </div>

      <div>
        <Label>Resultado</Label>
        <Select
          value={filters.resultado ?? "all"}
          placeholder="Todos"
          options={[
            { value: "all", label: "Todos" },
            ...RESULTADOS_SERVICIO.map((item) => ({ value: item.value, label: item.label })),
          ]}
          onChange={(value) =>
            onChange({
              resultado: value === "all" ? undefined : value,
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
          options={SERVICIO_REPRODUCTIVO_SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={(value) =>
            onChange({ sort_by: value as ServicioReproductivoFilters["sort_by"] })
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
            onChange({ sort_dir: value as ServicioReproductivoSortDirection })
          }
        />
      </div>
    </div>
  );
}
