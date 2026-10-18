import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { AlmacenForm } from "../components";

export default function AlmacenCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nuevo almacén" items={breadcrumbs.almacenCrear} />
      <ComponentCard title="Formulario de almacén">
        <AlmacenForm />
      </ComponentCard>
    </div>
  );
}
