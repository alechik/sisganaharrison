import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { CategoriaAnimalForm } from "../components";

export default function CategoriaAnimalCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Nueva Categoría"
        items={breadcrumbs.categoriaAnimalCrear}
      />
      <ComponentCard title="Formulario de Categoría">
        <CategoriaAnimalForm />
      </ComponentCard>
    </div>
  );
}
