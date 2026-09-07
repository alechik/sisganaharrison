import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { TipoPersonaForm } from "../components";

export default function TipoPersonaEditPage() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Editar tipo" items={breadcrumbs.tipoPersonaEditar} />
      <ComponentCard title="Editar tipo de persona">
        <TipoPersonaForm tipoId={Number(id)} />
      </ComponentCard>
    </div>
  );
}
