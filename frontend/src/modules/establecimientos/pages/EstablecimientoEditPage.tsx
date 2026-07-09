import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { EstablecimientoForm } from "../components";

export default function EstablecimientoEditPage() {
  const { id } = useParams();
  const establecimientoId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Editar establecimiento"
        items={breadcrumbs.establecimientoEditar}
      />
      <ComponentCard title="Formulario de establecimiento">
        <EstablecimientoForm establecimientoId={establecimientoId} />
      </ComponentCard>
    </div>
  );
}
