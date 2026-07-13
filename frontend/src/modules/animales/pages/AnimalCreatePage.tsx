import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { AnimalForm } from "../components";

export default function AnimalCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Nuevo animal"
        items={breadcrumbs.animalCrear}
      />
      <ComponentCard title="Formulario de animal">
        <AnimalForm />
      </ComponentCard>
    </div>
  );
}
