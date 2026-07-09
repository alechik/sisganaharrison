import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { EstablecimientoForm } from "../components";

export default function EstablecimientoCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Nuevo establecimiento"
        items={breadcrumbs.establecimientoCrear}
      />
      <ComponentCard title="Formulario de establecimiento">
        <EstablecimientoForm />
      </ComponentCard>
    </div>
  );
}
