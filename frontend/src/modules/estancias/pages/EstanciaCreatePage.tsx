import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { EstanciaForm } from "../components";

export default function EstanciaCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Nueva estancia"
        items={breadcrumbs.estanciaCrear}
      />
      <ComponentCard title="Formulario de estancia">
        <EstanciaForm />
      </ComponentCard>
    </div>
  );
}
