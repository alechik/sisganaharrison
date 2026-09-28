import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { TraspasoForm } from "../components";

export default function TraspasoCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nuevo traspaso" items={breadcrumbs.traspasoCrear} />
      <ComponentCard title="Formulario de traspaso">
        <TraspasoForm />
      </ComponentCard>
    </div>
  );
}
