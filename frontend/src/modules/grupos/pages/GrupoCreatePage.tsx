import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { GrupoForm } from "../components";

export default function GrupoCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nuevo grupo" items={breadcrumbs.grupoCrear} />
      <ComponentCard title="Formulario de grupo">
        <GrupoForm />
      </ComponentCard>
    </div>
  );
}
