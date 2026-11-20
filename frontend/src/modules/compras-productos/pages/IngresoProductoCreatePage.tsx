import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { IngresoProductoForm } from "../components";

export default function IngresoProductoCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nuevo ingreso de productos" items={breadcrumbs.ingresoProductoCrear} />
      <ComponentCard
        title="Registrar ingreso de productos"
        desc="Complete la cabecera y el detalle. El código se genera al confirmar. Puede cargar varios productos de forma manual o con Excel."
      >
        <IngresoProductoForm />
      </ComponentCard>
    </div>
  );
}
