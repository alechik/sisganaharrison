import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { MedicamentoForm } from "../components";

export default function MedicamentoCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Nuevo medicamento"
        items={breadcrumbs.medicamentoCrear}
      />
      <ComponentCard title="Formulario de Medicamento">
        <MedicamentoForm />
      </ComponentCard>
    </div>
  );
}
