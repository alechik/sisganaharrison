import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { SubcategoriaProductoForm } from "../components";

export default function SubcategoriaProductoCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nueva subcategoría" items={breadcrumbs.subcategoriaProductoCrear} />
      <ComponentCard title="Formulario de subcategoría de producto">
        <SubcategoriaProductoForm />
      </ComponentCard>
    </div>
  );
}
