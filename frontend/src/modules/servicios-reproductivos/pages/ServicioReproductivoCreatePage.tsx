import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { ServicioReproductivoForm } from "../components";

export default function ServicioReproductivoCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Nuevo Servicio Reproductivo"
        items={breadcrumbs.servicioReproductivoCrear}
      />
      <ComponentCard title="Formulario de Servicio Reproductivo">
        <ServicioReproductivoForm />
      </ComponentCard>
    </div>
  );
}
