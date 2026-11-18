import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { PotreroForm } from "../components";

export default function PotreroEditPage() {
  const { id } = useParams();
  const potreroId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Editar potrero"
        items={breadcrumbs.potreroEditar}
      />
      <ComponentCard title="Formulario de potrero">
        <PotreroForm potreroId={potreroId} />
      </ComponentCard>
    </div>
  );
}
