import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { PresentacionForm } from "../components";

export default function PresentacionCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nueva presentación" items={breadcrumbs.presentacionCrear} />
      <ComponentCard title="Formulario de presentación">
        <PresentacionForm />
      </ComponentCard>
    </div>
  );
}
