import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { TareaForm } from "../components";

export default function TareaCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nueva tarea" items={breadcrumbs.tareaCrear} />
      <ComponentCard title="Formulario de tarea">
        <TareaForm />
      </ComponentCard>
    </div>
  );
}
