import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { LoteForm } from "../components";

export default function LoteEditPage() {
  const { id } = useParams();
  const loteId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Editar lote"
        items={breadcrumbs.loteEditar}
      />
      <ComponentCard title="Formulario de lote">
        <LoteForm loteId={loteId} />
      </ComponentCard>
    </div>
  );
}
