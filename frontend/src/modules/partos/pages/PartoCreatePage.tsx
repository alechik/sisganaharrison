import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { PartoForm } from "../components";

export default function PartoCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nuevo Parto" items={breadcrumbs.partoCrear} />
      <ComponentCard title="Formulario de Parto">
        <PartoForm />
      </ComponentCard>
    </div>
  );
}
