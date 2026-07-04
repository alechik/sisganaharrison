import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { TipoEventoSanitarioForm } from "../components";

export default function TipoEventoSanitarioCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Nuevo Tipo de Evento Sanitario"
        items={breadcrumbs.tipoEventoSanitarioCrear}
      />
      <ComponentCard title="Formulario de Tipo de Evento Sanitario">
        <TipoEventoSanitarioForm />
      </ComponentCard>
    </div>
  );
}
