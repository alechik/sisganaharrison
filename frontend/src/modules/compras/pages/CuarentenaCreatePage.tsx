import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { CuarentenaForm } from "../components";

export default function CuarentenaCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Cuarentena directa" items={breadcrumbs.cuarentenaCrear} />
      <ComponentCard title="Registrar cuarentena por excepción">
        <CuarentenaForm />
      </ComponentCard>
    </div>
  );
}
