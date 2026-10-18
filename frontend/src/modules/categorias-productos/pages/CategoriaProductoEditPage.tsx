import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { CategoriaProductoForm } from "../components";

export default function CategoriaProductoEditPage() {
  const { id } = useParams();
  const categoriaId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Editar categoría" items={breadcrumbs.categoriaProductoEditar} />
      <ComponentCard title="Editar categoría de producto">
        <CategoriaProductoForm categoriaId={categoriaId} />
      </ComponentCard>
    </div>
  );
}
