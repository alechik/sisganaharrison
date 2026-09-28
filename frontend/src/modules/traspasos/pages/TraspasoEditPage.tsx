import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { hasPermission } from "@/utils/permissions";
import { TraspasoForm } from "../components";
import { TRASPASOS_PERMISSIONS } from "../permissions";

export default function TraspasoEditPage() {
  const { id } = useParams();
  const traspasoId = Number(id);

  if (!hasPermission(TRASPASOS_PERMISSIONS.update)) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        No tiene permiso para editar traspasos.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Editar traspaso" items={breadcrumbs.traspasoEditar} />
      <ComponentCard title="Editar traspaso">
        <TraspasoForm traspasoId={traspasoId} />
      </ComponentCard>
    </div>
  );
}
