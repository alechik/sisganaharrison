import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { SOCIO_SORT_OPTIONS } from "../constants";
import { useTipoPersonaOptions } from "../hooks";
import { SocioFilters, SocioSortDirection } from "../types";
import { getTipoLabel } from "../utils";

interface Props {
  filters: SocioFilters;
  onChange: (partial: Partial<SocioFilters>) => void;
  lockTipo?: boolean;
}

export default function SocioFiltersBar({ filters, onChange, lockTipo = false }: Props) {
  const { tipos } = useTipoPersonaOptions();

  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:grid-cols-2 xl:grid-cols-4">
      <div>
        <Label>Búsqueda</Label>
        <InputField
          type="text"
          placeholder="Razón social, responsable, email, NIT o CI"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      {!lockTipo && (
        <div>
          <Label>Tipo</Label>
          <Select
            value={filters.tipo ?? "all"}
            placeholder="Todos"
            options={[
              { value: "all", label: "Todos" },
              ...tipos.map((tipo) => ({
                value: tipo.nombre,
                label: getTipoLabel(tipo.nombre),
              })),
            ]}
            onChange={(value) => onChange({ tipo: value === "all" ? undefined : value })}
          />
        </div>
      )}

      <div>
        <Label>Estado</Label>
        <Select
          value={
            filters.estado === undefined
              ? "all"
              : filters.estado === true || filters.estado === "ACTIVO" || filters.estado === "true"
                ? "true"
                : "false"
          }
          placeholder="Todos"
          options={[
            { value: "all", label: "Todos" },
            { value: "true", label: "Activos" },
            { value: "false", label: "Inactivos" },
          ]}
          onChange={(value) =>
            onChange({
              estado: value === "all" ? undefined : value === "true",
            })
          }
        />
      </div>

      <div>
        <Label>Ordenar por</Label>
        <Select
          value={filters.sort_by}
          options={SOCIO_SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={(value) => onChange({ sort_by: value as SocioFilters["sort_by"] })}
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
          onChange={(value) => onChange({ sort_dir: value as SocioSortDirection })}
        />
      </div>
    </div>
  );
}
