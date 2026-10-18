import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { CategoriaProductoForm } from "../components";

export default function CategoriaProductoCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nueva categoría" items={breadcrumbs.categoriaProductoCrear} />
      <ComponentCard title="Formulario de categoría de producto">
        <CategoriaProductoForm />
      </ComponentCard>
    </div>
  );
}
