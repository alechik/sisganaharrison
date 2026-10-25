import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { TareaForm } from "../components";

export default function TareaEditPage() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Responder tarea" items={breadcrumbs.tareaEditar} />
      <ComponentCard title="Respuesta de la tarea">
        <TareaForm tareaId={Number(id)} />
      </ComponentCard>
    </div>
  );
}
