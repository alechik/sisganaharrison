import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { SocioForm } from "../components";

export default function SocioCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nuevo socio" items={breadcrumbs.socioCrear} />
      <ComponentCard title="Formulario de socio de negocios">
        <SocioForm />
      </ComponentCard>
    </div>
  );
}
