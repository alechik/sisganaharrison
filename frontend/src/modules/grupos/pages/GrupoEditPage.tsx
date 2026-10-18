import { useParams } from "react-router-dom";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { GrupoForm } from "../components";

export default function GrupoEditPage() {
  const grupoId = Number(useParams().id);
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Editar grupo" items={breadcrumbs.grupoEditar} />
      <ComponentCard title="Formulario de grupo">
        <GrupoForm grupoId={grupoId} />
      </ComponentCard>
    </div>
  );
}
