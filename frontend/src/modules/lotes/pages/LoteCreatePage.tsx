import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { LoteForm } from "../components";

export default function LoteCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Nuevo lote"
        items={breadcrumbs.loteCrear}
      />
      <ComponentCard title="Formulario de lote">
        <LoteForm />
      </ComponentCard>
    </div>
  );
}
