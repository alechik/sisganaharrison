import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { OrdenCompraForm } from "../components";

export default function OrdenCompraCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nueva orden de compra" items={breadcrumbs.ordenCompraCrear} />
      <ComponentCard title="Registrar orden de compra">
        <OrdenCompraForm />
      </ComponentCard>
    </div>
  );
}
