import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { TipoSalidaForm } from "../components";

export default function TipoSalidaEditPage() {
  const { id } = useParams();
  const tipoSalidaId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Editar tipo de salida" items={breadcrumbs.tipoSalidaEditar} />
      <ComponentCard title="Formulario de tipo de salida">
        <TipoSalidaForm tipoSalidaId={tipoSalidaId} />
      </ComponentCard>
    </div>
  );
}
