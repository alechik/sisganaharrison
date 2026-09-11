import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { OrdenCompraForm } from "../components";

export default function OrdenCompraEditPage() {
  const { id } = useParams();
  const ordenId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Editar orden de compra" items={breadcrumbs.ordenCompraEditar} />
      <ComponentCard title="Editar orden pendiente">
        <OrdenCompraForm ordenId={ordenId} />
      </ComponentCard>
    </div>
  );
}
