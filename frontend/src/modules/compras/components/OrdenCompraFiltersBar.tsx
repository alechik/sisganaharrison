import { useEffect, useState } from "react";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { getSocios } from "@/modules/socios-de-negocio/services";
import { getUsers } from "@/modules/user/services/userService";
import { hasPermission } from "@/utils/permissions";
import { ORDEN_COMPRA_ESTADOS, ORDEN_COMPRA_SORT_OPTIONS } from "../constants";
import { OrdenCompraFilters, OrdenCompraSortDirection } from "../types";

interface Props {
  filters: OrdenCompraFilters;
  onChange: (partial: Partial<OrdenCompraFilters>) => void;
}

export default function OrdenCompraFiltersBar({ filters, onChange }: Props) {
  const [proveedores, setProveedores] = useState<{ value: string; label: string }[]>([]);
  const [usuarios, setUsuarios] = useState<{ value: string; label: string }[]>([]);
  const canFilterUsers = hasPermission("usuarios.view");

  useEffect(() => {
    const load = async () => {
      try {
        const socios = await getSocios({
          tiene_tipo: "PROVEEDOR",
          per_page: 100,
          page: 1,
        });
        setProveedores(
          socios.data.map((socio) => ({
            value: String(socio.id),
            label: socio.razon_social,
          }))
        );
      } catch (err) {
        console.error(err);
      }

      if (!canFilterUsers) {
        return;
      }

      try {
        const users = await getUsers({ per_page: 100, page: 1 });
        setUsuarios(
          users.data.map((user) => ({
            value: String(user.id),
            label: `${user.nombre} ${user.apellido}`,
          }))
        );
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [canFilterUsers]);

  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:grid-cols-2 xl:grid-cols-3">
      <div>
        <Label>Código</Label>
        <InputField
          type="text"
          placeholder="OC-2026-0001"
          value={filters.cod_compra ?? ""}
          onChange={(e) => onChange({ cod_compra: e.target.value })}
        />
      </div>

      <div>
        <Label>Proveedor</Label>
        <Select
          value={filters.proveedor_id ? String(filters.proveedor_id) : "all"}
          placeholder="Todos"
          options={[{ value: "all", label: "Todos" }, ...proveedores]}
          onChange={(value) =>
            onChange({ proveedor_id: value === "all" ? undefined : Number(value) })
          }
        />
      </div>

      <div>
        <Label>Fecha</Label>
        <InputField
          type="date"
          value={filters.fecha ?? ""}
          onChange={(e) => onChange({ fecha: e.target.value })}
        />
      </div>

      <div>
        <Label>Estado</Label>
        <Select
          value={filters.estado || "all"}
          placeholder="Todos"
          options={[
            { value: "all", label: "Todos" },
            ...ORDEN_COMPRA_ESTADOS.map((estado) => ({
              value: estado.value,
              label: estado.label,
            })),
          ]}
          onChange={(value) => onChange({ estado: value === "all" ? undefined : value })}
        />
      </div>

      {canFilterUsers && (
        <div>
          <Label>Usuario creador</Label>
          <Select
            value={filters.user_id ? String(filters.user_id) : "all"}
            placeholder="Todos"
            options={[{ value: "all", label: "Todos" }, ...usuarios]}
            onChange={(value) =>
              onChange({ user_id: value === "all" ? undefined : Number(value) })
            }
          />
        </div>
      )}

      <div>
        <Label>Ordenar por</Label>
        <Select
          value={filters.sort_by}
          options={ORDEN_COMPRA_SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={(value) => onChange({ sort_by: value as OrdenCompraFilters["sort_by"] })}
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
          onChange={(value) => onChange({ sort_dir: value as OrdenCompraSortDirection })}
        />
      </div>
    </div>
  );
}
