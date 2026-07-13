import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { AnimalForm } from "../components";

export default function AnimalEditPage() {
  const { id } = useParams();
  const animalId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Editar animal"
        items={breadcrumbs.animalEditar}
      />
      <ComponentCard title="Formulario de animal">
        <AnimalForm animalId={animalId} />
      </ComponentCard>
    </div>
  );
}
