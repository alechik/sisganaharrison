import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { SubcategoriaProductoForm } from "../components";

export default function SubcategoriaProductoEditPage() {
  const { id } = useParams();
  const subcategoriaId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Editar subcategoría" items={breadcrumbs.subcategoriaProductoEditar} />
      <ComponentCard title="Editar subcategoría de producto">
        <SubcategoriaProductoForm subcategoriaId={subcategoriaId} />
      </ComponentCard>
    </div>
  );
}
