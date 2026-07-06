import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { TipoAlertaForm } from "../components";

export default function TipoAlertaCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Nuevo tipo de alerta"
        items={breadcrumbs.tipoAlertaCrear}
      />
      <ComponentCard title="Formulario de tipo de alerta">
        <TipoAlertaForm />
      </ComponentCard>
    </div>
  );
}
