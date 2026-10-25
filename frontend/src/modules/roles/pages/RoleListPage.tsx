import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { RoleTable } from "../components";
import { useRoles } from "../hooks";

export default function RoleListPage() {
  const { roles, loading, error, successMessage, clearSuccess } = useRoles();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestión de Roles</h1>
        <PageBreadCrumb pageTitle="Roles" items={breadcrumbs.roles} />
      </div>

      {loading && roles.length === 0 && !error && (
        <div className="text-sm text-gray-500 dark:text-gray-400">Cargando roles...</div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
          {successMessage}
          <button type="button" className="ml-3 underline" onClick={clearSuccess}>
            Cerrar
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      <RoleTable roles={roles} />
    </div>
  );
}
