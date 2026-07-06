import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { TipoMovimientoForm } from "../components";

export default function TipoMovimientoCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Nuevo tipo de movimiento"
        items={breadcrumbs.tipoMovimientoCrear}
      />
      <ComponentCard title="Formulario de tipo de movimiento">
        <TipoMovimientoForm />
      </ComponentCard>
    </div>
  );
}
