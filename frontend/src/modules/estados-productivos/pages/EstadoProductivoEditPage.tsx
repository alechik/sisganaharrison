import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { EstadoProductivoForm } from "../components";

export default function EstadoProductivoEditPage() {
  const { id } = useParams();
  const estadoProductivoId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Editar Estado Productivo"
        items={breadcrumbs.estadoProductivoEditar}
      />
      <ComponentCard title="Formulario de Estado Productivo">
        <EstadoProductivoForm estadoProductivoId={estadoProductivoId} />
      </ComponentCard>
    </div>
  );
}
