import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { RazaForm } from "../components";

export default function RazaCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nueva Raza" items={breadcrumbs.razaCrear} />
      <ComponentCard title="Formulario de Raza">
        <RazaForm />
      </ComponentCard>
    </div>
  );
}
