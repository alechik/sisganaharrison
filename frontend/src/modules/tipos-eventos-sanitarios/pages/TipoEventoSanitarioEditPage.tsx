import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { TipoEventoSanitarioForm } from "../components";

export default function TipoEventoSanitarioEditPage() {
  const { id } = useParams();
  const tipoEventoSanitarioId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Editar Tipo de Evento Sanitario"
        items={breadcrumbs.tipoEventoSanitarioEditar}
      />
      <ComponentCard title="Formulario de Tipo de Evento Sanitario">
        <TipoEventoSanitarioForm tipoEventoSanitarioId={tipoEventoSanitarioId} />
      </ComponentCard>
    </div>
  );
}
