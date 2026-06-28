import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { RazaForm } from "../components";

export default function RazaEditPage() {
  const { id } = useParams();
  const razaId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Editar Raza" items={breadcrumbs.razaEditar} />
      <ComponentCard title="Editar Raza">
        <RazaForm razaId={razaId} />
      </ComponentCard>
    </div>
  );
}
