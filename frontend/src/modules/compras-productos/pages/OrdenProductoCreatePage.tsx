import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { OrdenProductoForm } from "../components";

export default function OrdenProductoCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nueva orden de productos" items={breadcrumbs.ordenProductoCrear} />
      <ComponentCard title="Registrar orden de compra de productos">
        <OrdenProductoForm />
      </ComponentCard>
    </div>
  );
}
