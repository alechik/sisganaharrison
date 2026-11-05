import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { CuarentenaForm } from "../components";

export default function CuarentenaCreatePage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Compra efectuada" items={breadcrumbs.cuarentenaCrear} />
      <ComponentCard title="Registrar compra ya efectuada (sin orden)">
        <CuarentenaForm />
      </ComponentCard>
    </div>
  );
}
