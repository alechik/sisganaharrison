import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { EVENTO_SANITARIO_SORT_OPTIONS } from "../constants";
import { useSanitarioReferenceOptions } from "../hooks";
import { EventoSanitarioFilters, EventoSanitarioSortDirection } from "../types";

interface Props {
  filters: EventoSanitarioFilters;
  onChange: (partial: Partial<EventoSanitarioFilters>) => void;
}

export default function EventoSanitarioFiltersBar({ filters, onChange }: Props) {
  const { animalOptions, tipoEventoOptions, vacunaOptions } = useSanitarioReferenceOptions();

  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <div>
        <Label>Búsqueda</Label>
        <InputField
          type="text"
          placeholder="Animal, tipo, vacuna u observaciones"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      <div>
        <Label>Animal</Label>
        <Select
          value={filters.animal_id ? String(filters.animal_id) : "all"}
          placeholder="Todos"
          options={[{ value: "all", label: "Todos" }, ...animalOptions]}
          onChange={(value) =>
            onChange({
              animal_id: value === "all" ? undefined : Number(value),
            })
          }
        />
      </div>

      <div>
        <Label>Tipo de evento</Label>
        <Select
          value={filters.tipo_evento_id ? String(filters.tipo_evento_id) : "all"}
          placeholder="Todos"
          options={[{ value: "all", label: "Todos" }, ...tipoEventoOptions]}
          onChange={(value) =>
            onChange({
              tipo_evento_id: value === "all" ? undefined : Number(value),
            })
          }
        />
      </div>

      <div>
        <Label>Vacuna</Label>
        <Select
          value={filters.vacuna_id ? String(filters.vacuna_id) : "all"}
          placeholder="Todas"
          options={[{ value: "all", label: "Todas" }, ...vacunaOptions]}
          onChange={(value) =>
            onChange({
              vacuna_id: value === "all" ? undefined : Number(value),
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
          options={EVENTO_SANITARIO_SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={(value) =>
            onChange({ sort_by: value as EventoSanitarioFilters["sort_by"] })
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
          onChange={(value) => onChange({ sort_dir: value as EventoSanitarioSortDirection })}
        />
      </div>
    </div>
  );
}
