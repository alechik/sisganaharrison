import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { TipoSalidaForm } from "../components";

export default function TipoSalidaCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nuevo tipo de salida" items={breadcrumbs.tipoSalidaCrear} />
      <ComponentCard title="Formulario de tipo de salida">
        <TipoSalidaForm />
      </ComponentCard>
    </div>
  );
}
