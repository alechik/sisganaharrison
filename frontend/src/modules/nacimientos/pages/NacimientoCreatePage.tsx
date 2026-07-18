import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { NacimientoForm } from "../components";

export default function NacimientoCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nuevo Nacimiento" items={breadcrumbs.nacimientoCrear} />
      <ComponentCard title="Formulario de Nacimiento">
        <NacimientoForm />
      </ComponentCard>
    </div>
  );
}
