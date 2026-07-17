import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { ServicioReproductivoForm } from "../components";

export default function ServicioReproductivoEditPage() {
  const { id } = useParams();
  const servicioId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Editar Servicio Reproductivo"
        items={breadcrumbs.servicioReproductivoEditar}
      />
      <ComponentCard title="Formulario de Servicio Reproductivo">
        <ServicioReproductivoForm servicioId={servicioId} />
      </ComponentCard>
    </div>
  );
}
