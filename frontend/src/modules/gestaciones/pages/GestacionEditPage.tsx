import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { GestacionForm } from "../components";

export default function GestacionEditPage() {
  const { id } = useParams();
  const gestacionId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Editar Gestación"
        items={breadcrumbs.gestacionEditar}
      />
      <ComponentCard title="Formulario de Gestación">
        <GestacionForm gestacionId={gestacionId} />
      </ComponentCard>
    </div>
  );
}
