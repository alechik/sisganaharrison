import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { IngresoProductoForm } from "../components";

export default function IngresoProductoCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nuevo ingreso de productos" items={breadcrumbs.ingresoProductoCrear} />
      <ComponentCard title="Registrar ingreso desde una orden autorizada">
        <IngresoProductoForm />
      </ComponentCard>
    </div>
  );
}
