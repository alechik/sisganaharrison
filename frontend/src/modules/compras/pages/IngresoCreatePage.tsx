import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { IngresoForm } from "../components";

export default function IngresoCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nuevo ingreso" items={breadcrumbs.ingresoCrear} />
      <ComponentCard
        title="Registrar ingreso físico de animales"
        desc="Complete la cabecera y el detalle de animales. Cada animal se crea al confirmar el ingreso."
      >
        <IngresoForm />
      </ComponentCard>
    </div>
  );
}
