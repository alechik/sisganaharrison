import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { TipoPersonaForm } from "../components";

export default function TipoPersonaCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nuevo tipo" items={breadcrumbs.tipoPersonaCrear} />
      <ComponentCard title="Formulario de tipo de persona">
        <TipoPersonaForm />
      </ComponentCard>
    </div>
  );
}
