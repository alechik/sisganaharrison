import { useEffect, useState } from "react";

import DebouncedSearchField from "@/components/form/DebouncedSearchField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { getCategoriasProductos } from "@/modules/categorias-productos/services";
import { SUBCATEGORIA_PRODUCTO_SORT_OPTIONS } from "../constants";
import { SubcategoriaProductoFilters, SubcategoriaProductoSortDirection } from "../types";

interface Props {
  filters: SubcategoriaProductoFilters;
  onChange: (partial: Partial<SubcategoriaProductoFilters>) => void;
}

export default function SubcategoriaProductoFiltersBar({ filters, onChange }: Props) {
  const [categorias, setCategorias] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    getCategoriasProductos({ per_page: 100, sort_by: "nombre", sort_dir: "asc" })
      .then((res) => setCategorias(res.data.map((item) => ({ value: String(item.id), label: item.nombre }))))
      .catch(console.error);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:grid-cols-2 xl:grid-cols-4">
      <div>
        <Label>Búsqueda</Label>
        <DebouncedSearchField
          placeholder="Nombre"
          value={filters.search ?? ""}
          onValueChange={(search) => onChange({ search })}
        />
      </div>

      <div>
        <Label>Categoría</Label>
        <Select
          value={filters.categoria_producto_id ? String(filters.categoria_producto_id) : "all"}
          placeholder="Todas"
          options={[{ value: "all", label: "Todas" }, ...categorias]}
          onChange={(value) =>
            onChange({
              categoria_producto_id: value === "all" ? undefined : Number(value),
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
          options={SUBCATEGORIA_PRODUCTO_SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={(value) => onChange({ sort_by: value as SubcategoriaProductoFilters["sort_by"] })}
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
          onChange={(value) => onChange({ sort_dir: value as SubcategoriaProductoSortDirection })}
        />
      </div>
    </div>
  );
}
