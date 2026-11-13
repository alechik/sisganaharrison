import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { PesajeForm } from "../components";

export default function PesajeCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nuevo Pesaje" items={breadcrumbs.pesajeCrear} />
      <ComponentCard
        title="Registrar pesaje de animales"
        desc="Complete la cabecera y el detalle. El código se genera al confirmar. Puede cargar varios animales de forma manual o con Excel."
      >
        <PesajeForm />
      </ComponentCard>
    </div>
  );
}
