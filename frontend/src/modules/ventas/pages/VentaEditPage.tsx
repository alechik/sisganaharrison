import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { VentaForm } from "../components";

export default function VentaEditPage() {
  const { id } = useParams();
  const ventaId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Editar venta" items={breadcrumbs.ventaEditar} />
      <ComponentCard title="Editar venta pendiente">
        <VentaForm ventaId={ventaId} />
      </ComponentCard>
    </div>
  );
}
