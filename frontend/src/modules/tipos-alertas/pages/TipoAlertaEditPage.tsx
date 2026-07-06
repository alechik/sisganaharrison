import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { TipoAlertaForm } from "../components";

export default function TipoAlertaEditPage() {
  const { id } = useParams();
  const tipoAlertaId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Editar tipo de alerta"
        items={breadcrumbs.tipoAlertaEditar}
      />
      <ComponentCard title="Formulario de tipo de alerta">
        <TipoAlertaForm tipoAlertaId={tipoAlertaId} />
      </ComponentCard>
    </div>
  );
}
