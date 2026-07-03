import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { VacunaForm } from "../components";

export default function VacunaCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Nueva Vacuna"
        items={breadcrumbs.vacunaCrear}
      />
      <ComponentCard title="Formulario de Vacuna">
        <VacunaForm />
      </ComponentCard>
    </div>
  );
}
