import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { TipoIngresoForm } from "../components";

export default function TipoIngresoEditPage() {
  const { id } = useParams();
  const tipoId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Editar tipo de ingreso" items={breadcrumbs.tipoIngresoEditar} />
      <ComponentCard title="Editar tipo de ingreso">
        <TipoIngresoForm tipoId={tipoId} />
      </ComponentCard>
    </div>
  );
}
