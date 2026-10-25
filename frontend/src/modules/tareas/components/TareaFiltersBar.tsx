import { useEffect, useState } from "react";

import DebouncedSearchField from "@/components/form/DebouncedSearchField";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { canManageTareas } from "@/utils/roles";
import { TAREA_ESTADO_OPTIONS, TAREA_SORT_OPTIONS } from "../constants";
import { getAsignables } from "../services";
import { TareaFilters, TareaSortDirection, TareaUsuario } from "../types";

interface Props {
  filters: TareaFilters;
  onChange: (partial: Partial<TareaFilters>) => void;
}

export default function TareaFiltersBar({ filters, onChange }: Props) {
  const showAsignado = canManageTareas();
  const [asignables, setAsignables] = useState<TareaUsuario[]>([]);

  useEffect(() => {
    if (!showAsignado) {
      return;
    }

    getAsignables()
      .then(setAsignables)
      .catch(() => setAsignables([]));
  }, [showAsignado]);

  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:grid-cols-2 xl:grid-cols-3">
      <div>
        <Label>Búsqueda</Label>
        <DebouncedSearchField
          placeholder="Código o indicación"
          value={filters.search ?? ""}
          onValueChange={(search) => onChange({ search })}
        />
      </div>

      <div>
        <Label>Estado</Label>
        <Select
          value={filters.estado ?? "all"}
          placeholder="Todos"
          options={[
            { value: "all", label: "Todos" },
            ...TAREA_ESTADO_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            })),
          ]}
          onChange={(value) =>
            onChange({
              estado: value === "all" ? undefined : (value as TareaFilters["estado"]),
            })
          }
        />
      </div>

      {showAsignado && (
        <div>
          <Label>Usuario asignado</Label>
          <Select
            value={filters.user_trabajador_id ? String(filters.user_trabajador_id) : "all"}
            placeholder="Todos"
            options={[
              { value: "all", label: "Todos" },
              ...asignables.map((user) => ({
                value: String(user.id),
                label: user.nombre,
              })),
            ]}
            onChange={(value) =>
              onChange({
                user_trabajador_id: value === "all" ? undefined : Number(value),
              })
            }
          />
        </div>
      )}

      <div>
        <Label>Fecha desde</Label>
        <InputField
          type="date"
          value={filters.fecha_desde ?? ""}
          onChange={(event) => onChange({ fecha_desde: event.target.value })}
        />
      </div>

      <div>
        <Label>Fecha hasta</Label>
        <InputField
          type="date"
          value={filters.fecha_hasta ?? ""}
          onChange={(event) => onChange({ fecha_hasta: event.target.value })}
        />
      </div>

      <div>
        <Label>Ordenar por</Label>
        <Select
          value={filters.sort_by}
          options={TAREA_SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={(value) => onChange({ sort_by: value as TareaFilters["sort_by"] })}
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
          onChange={(value) => onChange({ sort_dir: value as TareaSortDirection })}
        />
      </div>
    </div>
  );
}
