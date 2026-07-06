import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { TipoMovimientoForm } from "../components";

export default function TipoMovimientoEditPage() {
  const { id } = useParams();
  const tipoMovimientoId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Editar tipo de movimiento"
        items={breadcrumbs.tipoMovimientoEditar}
      />
      <ComponentCard title="Formulario de tipo de movimiento">
        <TipoMovimientoForm tipoMovimientoId={tipoMovimientoId} />
      </ComponentCard>
    </div>
  );
}
