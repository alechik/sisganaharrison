import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { EstanciaForm } from "../components";

export default function EstanciaEditPage() {
  const { id } = useParams();
  const estanciaId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Editar estancia"
        items={breadcrumbs.estanciaEditar}
      />
      <ComponentCard title="Formulario de estancia">
        <EstanciaForm estanciaId={estanciaId} />
      </ComponentCard>
    </div>
  );
}
