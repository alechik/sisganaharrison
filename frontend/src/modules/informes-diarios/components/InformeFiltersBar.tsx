import { useEffect, useState } from "react";

import DebouncedSearchField from "@/components/form/DebouncedSearchField";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { canRevisarInformesDiarios } from "@/utils/roles";
import { INFORME_REVISADO_OPTIONS, INFORME_SORT_OPTIONS } from "../constants";
import { getTrabajadoresInforme } from "../services";
import { InformeDiarioFilters, InformeSortDirection, InformeUsuario } from "../types";

interface Props {
  filters: InformeDiarioFilters;
  onChange: (partial: Partial<InformeDiarioFilters>) => void;
}

export default function InformeFiltersBar({ filters, onChange }: Props) {
  const showTrabajador = canRevisarInformesDiarios();
  const [trabajadores, setTrabajadores] = useState<InformeUsuario[]>([]);

  useEffect(() => {
    if (!showTrabajador) {
      return;
    }

    getTrabajadoresInforme()
      .then(setTrabajadores)
      .catch(() => setTrabajadores([]));
  }, [showTrabajador]);

  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:grid-cols-2 xl:grid-cols-3">
      <div>
        <Label>Búsqueda</Label>
        <DebouncedSearchField
          placeholder="Código o contenido"
          value={filters.search ?? ""}
          onValueChange={(search) => onChange({ search })}
        />
      </div>

      <div>
        <Label>Revisado</Label>
        <Select
          value={filters.revisado ?? "all"}
          placeholder="Todos"
          options={[
            { value: "all", label: "Todos" },
            ...INFORME_REVISADO_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            })),
          ]}
          onChange={(value) =>
            onChange({
              revisado: value === "all" ? undefined : (value as InformeDiarioFilters["revisado"]),
            })
          }
        />
      </div>

      {showTrabajador && (
        <div>
          <Label>Trabajador</Label>
          <Select
            value={filters.user_trabajador_id ? String(filters.user_trabajador_id) : "all"}
            placeholder="Todos"
            options={[
              { value: "all", label: "Todos" },
              ...trabajadores.map((user) => ({
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
          options={INFORME_SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={(value) => onChange({ sort_by: value as InformeDiarioFilters["sort_by"] })}
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
          onChange={(value) => onChange({ sort_dir: value as InformeSortDirection })}
        />
      </div>
    </div>
  );
}
