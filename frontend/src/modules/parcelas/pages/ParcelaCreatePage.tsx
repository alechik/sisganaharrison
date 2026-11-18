import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { ParcelaForm } from "../components";

export default function ParcelaCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Nueva parcela"
        items={breadcrumbs.parcelaCrear}
      />
      <ComponentCard title="Formulario de parcela">
        <ParcelaForm />
      </ComponentCard>
    </div>
  );
}
