import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { EventoSanitarioForm } from "../components";

export default function EventoSanitarioCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Nuevo Evento Sanitario"
        items={breadcrumbs.eventoSanitarioCrear}
      />
      <ComponentCard title="Formulario de Evento Sanitario">
        <EventoSanitarioForm />
      </ComponentCard>
    </div>
  );
}
