import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { PartoForm } from "../components";

export default function PartoEditPage() {
  const { id } = useParams();
  const partoId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Editar Parto" items={breadcrumbs.partoEditar} />
      <ComponentCard title="Formulario de Parto">
        <PartoForm partoId={partoId} />
      </ComponentCard>
    </div>
  );
}
