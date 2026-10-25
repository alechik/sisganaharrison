import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "@/components/ui/button/Button";
import { canEditRole, hasRole } from "@/utils/roles";
import { getRoleLabel, ROLE_ROUTES } from "../constants";
import { useUpdateRole } from "../hooks";
import { getPermissionCatalog, getRole } from "../services";
import { groupPermissions } from "../utils";

interface Props {
  roleId: number;
}

export default function RoleForm({ roleId }: Props) {
  const navigate = useNavigate();
  const { update, loading: saving, error, setError } = useUpdateRole();

  const [roleName, setRoleName] = useState("");
  const [catalog, setCatalog] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [role, permissions] = await Promise.all([
          getRole(roleId),
          getPermissionCatalog(),
        ]);
        setRoleName(role.name);
        setCatalog(permissions);
        setSelected(role.permissions ?? []);
        if (role.name === "administrador" && !hasRole("administrador")) {
          setError("No puede modificar los permisos del rol administrador.");
        }
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el rol.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [roleId, setError]);

  const toggle = (permission: string) => {
    setSelected((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission]
    );
  };

  const toggleGroup = (permissions: string[], checked: boolean) => {
    setSelected((current) => {
      const without = current.filter((item) => !permissions.includes(item));
      return checked ? [...without, ...permissions] : without;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!canEditRole(roleName)) {
      setError("No puede modificar los permisos del rol administrador.");
      return;
    }

    try {
      await update(roleId, { permissions: selected });
      navigate(ROLE_ROUTES.detail(roleId));
    } catch {
      // hook
    }
  };

  if (loading) {
    return <div>Cargando formulario...</div>;
  }

  const groups = groupPermissions(catalog);
  const readOnly = !canEditRole(roleName);

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Rol: <span className="font-medium text-gray-800 dark:text-white">{getRoleLabel(roleName)}</span>
        {" "}({selected.length} permisos seleccionados)
      </p>

      <div className="space-y-4">
        {Object.entries(groups).map(([group, permissions]) => {
          const allSelected = permissions.every((permission) => selected.includes(permission));

          return (
            <div
              key={group}
              className="rounded-xl border border-gray-200 p-4 dark:border-white/[0.05]"
            >
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-white">
                <input
                  type="checkbox"
                  checked={allSelected}
                  disabled={readOnly}
                  onChange={(event) => toggleGroup(permissions, event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900"
                />
                {group.replace(/_/g, " ")}
              </label>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                {permissions.map((permission) => (
                  <label
                    key={permission}
                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(permission)}
                      disabled={readOnly}
                      onChange={() => toggle(permission)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900"
                    />
                    {permission}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-3">
        <Button size="sm" type="submit" disabled={saving || !canEditRole(roleName)}>
          {saving ? "Guardando..." : "Guardar permisos"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => navigate(ROLE_ROUTES.list)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
