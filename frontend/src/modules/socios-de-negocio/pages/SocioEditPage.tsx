import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { SocioForm } from "../components";

export default function SocioEditPage() {
  const { id } = useParams();
  const socioId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Editar socio" items={breadcrumbs.socioEditar} />
      <ComponentCard title="Editar socio de negocio">
        <SocioForm socioId={socioId} />
      </ComponentCard>
    </div>
  );
}
