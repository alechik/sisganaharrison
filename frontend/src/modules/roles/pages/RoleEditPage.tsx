import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { useParams } from "react-router-dom";
import { RoleForm } from "../components";

export default function RoleEditPage() {
  const { id } = useParams();
  const roleId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Editar rol" items={breadcrumbs.rolEditar} />
      <ComponentCard title="Permisos del rol">
        <RoleForm roleId={roleId} />
      </ComponentCard>
    </div>
  );
}
