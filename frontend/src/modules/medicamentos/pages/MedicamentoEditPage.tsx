import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { MedicamentoForm } from "../components";

export default function MedicamentoEditPage() {
  const { id } = useParams();
  const medicamentoId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Editar Medicamento"
        items={breadcrumbs.medicamentoEditar}
      />
      <ComponentCard title="Formulario de Medicamento">
        <MedicamentoForm medicamentoId={medicamentoId} />
      </ComponentCard>
    </div>
  );
}
