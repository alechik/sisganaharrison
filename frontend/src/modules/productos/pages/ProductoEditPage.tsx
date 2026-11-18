import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { ProductoForm } from "../components";

export default function ProductoEditPage() {
  const { id } = useParams();
  const productoId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Editar Producto"
        items={breadcrumbs.productoEditar}
      />
      <ComponentCard title="Formulario de Producto">
        <ProductoForm productoId={productoId} />
      </ComponentCard>
    </div>
  );
}
