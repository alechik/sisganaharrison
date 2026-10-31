import { Navigate, useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { canCrearInformesDiarios } from "@/utils/roles";
import { InformeForm } from "../components";
import { INFORME_DIARIO_ROUTES } from "../constants";

export default function InformeEditPage() {
  const { id } = useParams();

  if (!canCrearInformesDiarios()) {
    return <Navigate to={INFORME_DIARIO_ROUTES.list} replace />;
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Editar informe diario" items={breadcrumbs.informeDiarioEditar} />
      <ComponentCard title="Editar informe diario">
        <InformeForm informeId={Number(id)} />
      </ComponentCard>
    </div>
  );
}
