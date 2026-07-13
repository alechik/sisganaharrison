import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { ANIMAL_SEXO_OPTIONS, ANIMAL_SORT_OPTIONS } from "../constants";
import { useAnimalReferenceOptions } from "../hooks";
import { AnimalFilters, AnimalSortDirection } from "../types";

interface Props {
  filters: AnimalFilters;
  onChange: (partial: Partial<AnimalFilters>) => void;
}

export default function AnimalFiltersBar({ filters, onChange }: Props) {
  const {
    razaOptions,
    categoriaOptions,
    loteOptions,
    loading,
  } = useAnimalReferenceOptions();

  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
      <div>
        <Label>Búsqueda</Label>
        <InputField
          type="text"
          placeholder="Código, nombre o arete"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      <div>
        <Label>Raza</Label>
        <Select
          value={filters.raza_id ? String(filters.raza_id) : "all"}
          placeholder={loading ? "Cargando..." : "Todas"}
          options={[{ value: "all", label: "Todas" }, ...razaOptions]}
          onChange={(value) =>
            onChange({ raza_id: value === "all" ? undefined : Number(value) })
          }
        />
      </div>

      <div>
        <Label>Categoría</Label>
        <Select
          value={filters.categoria_id ? String(filters.categoria_id) : "all"}
          placeholder={loading ? "Cargando..." : "Todas"}
          options={[{ value: "all", label: "Todas" }, ...categoriaOptions]}
          onChange={(value) =>
            onChange({ categoria_id: value === "all" ? undefined : Number(value) })
          }
        />
      </div>

      <div>
        <Label>Lote</Label>
        <Select
          value={filters.lote_id ? String(filters.lote_id) : "all"}
          placeholder={loading ? "Cargando..." : "Todos"}
          options={[{ value: "all", label: "Todos" }, ...loteOptions]}
          onChange={(value) =>
            onChange({ lote_id: value === "all" ? undefined : Number(value) })
          }
        />
      </div>

      <div>
        <Label>Sexo</Label>
        <Select
          value={filters.sexo ?? "all"}
          placeholder="Todos"
          options={[
            { value: "all", label: "Todos" },
            ...ANIMAL_SEXO_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
          ]}
          onChange={(value) =>
            onChange({
              sexo: value === "all" ? undefined : (value as AnimalFilters["sexo"]),
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
          options={ANIMAL_SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={(value) =>
            onChange({ sort_by: value as AnimalFilters["sort_by"] })
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
            onChange({ sort_dir: value as AnimalSortDirection })
          }
        />
      </div>
    </div>
  );
}
