import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { PesajeForm } from "../components";

export default function PesajeCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nuevo Pesaje" items={breadcrumbs.pesajeCrear} />
      <ComponentCard title="Formulario de Pesaje">
        <PesajeForm />
      </ComponentCard>
    </div>
  );
}
