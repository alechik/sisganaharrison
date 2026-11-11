import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { TipoIngresoForm } from "../components";

export default function TipoIngresoCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nuevo tipo de ingreso" items={breadcrumbs.tipoIngresoCrear} />
      <ComponentCard title="Formulario de tipo de ingreso">
        <TipoIngresoForm />
      </ComponentCard>
    </div>
  );
}
