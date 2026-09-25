import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { VentaForm } from "../components";

export default function VentaCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nueva venta" items={breadcrumbs.ventaCrear} />
      <ComponentCard title="Registrar venta">
        <VentaForm />
      </ComponentCard>
    </div>
  );
}
