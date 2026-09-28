import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { PresentacionForm } from "../components";

export default function PresentacionEditPage() {
  const { id } = useParams();
  const presentacionId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Editar presentación" items={breadcrumbs.presentacionEditar} />
      <ComponentCard title="Formulario de presentación">
        <PresentacionForm presentacionId={presentacionId} />
      </ComponentCard>
    </div>
  );
}
