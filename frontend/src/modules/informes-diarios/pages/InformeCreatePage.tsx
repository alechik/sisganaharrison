import { Navigate } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { canCrearInformesDiarios } from "@/utils/roles";
import { InformeForm } from "../components";
import { INFORME_DIARIO_ROUTES } from "../constants";

export default function InformeCreatePage() {
  if (!canCrearInformesDiarios()) {
    return <Navigate to={INFORME_DIARIO_ROUTES.list} replace />;
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nuevo informe diario" items={breadcrumbs.informeDiarioCrear} />
      <ComponentCard title="Formulario de informe diario">
        <InformeForm />
      </ComponentCard>
    </div>
  );
}
