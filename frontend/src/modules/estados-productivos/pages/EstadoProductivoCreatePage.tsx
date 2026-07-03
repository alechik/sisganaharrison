import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { EstadoProductivoForm } from "../components";

export default function EstadoProductivoCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Nuevo Estado Productivo"
        items={breadcrumbs.estadoProductivoCrear}
      />
      <ComponentCard title="Formulario de Estado Productivo">
        <EstadoProductivoForm />
      </ComponentCard>
    </div>
  );
}
