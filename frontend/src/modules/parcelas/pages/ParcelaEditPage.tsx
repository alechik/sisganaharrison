import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { ParcelaForm } from "../components";

export default function ParcelaEditPage() {
  const { id } = useParams();
  const parcelaId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Editar parcela"
        items={breadcrumbs.parcelaEditar}
      />
      <ComponentCard title="Formulario de parcela">
        <ParcelaForm parcelaId={parcelaId} />
      </ComponentCard>
    </div>
  );
}
