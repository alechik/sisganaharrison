import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { GestacionForm } from "../components";

export default function GestacionCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Nueva Gestación"
        items={breadcrumbs.gestacionCrear}
      />
      <ComponentCard title="Formulario de Gestación">
        <GestacionForm />
      </ComponentCard>
    </div>
  );
}
