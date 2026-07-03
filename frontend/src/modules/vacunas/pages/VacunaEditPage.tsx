import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { VacunaForm } from "../components";

export default function VacunaEditPage() {
  const { id } = useParams();
  const vacunaId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Editar Vacuna"
        items={breadcrumbs.vacunaEditar}
      />
      <ComponentCard title="Formulario de Vacuna">
        <VacunaForm vacunaId={vacunaId} />
      </ComponentCard>
    </div>
  );
}
