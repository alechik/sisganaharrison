import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { ProductoForm } from "../components";

export default function ProductoCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Nuevo producto"
        items={breadcrumbs.productoCrear}
      />
      <ComponentCard title="Formulario de Producto">
        <ProductoForm />
      </ComponentCard>
    </div>
  );
}
