import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { CategoriaAnimalForm } from "../components";

export default function CategoriaAnimalEditPage() {
  const { id } = useParams();
  const categoriaId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Editar Categoría"
        items={breadcrumbs.categoriaAnimalEditar}
      />
      <ComponentCard title="Editar Categoría">
        <CategoriaAnimalForm categoriaId={categoriaId} />
      </ComponentCard>
    </div>
  );
}
