import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import { CuarentenaForm } from "../components";

export default function CuarentenaEditPage() {
  const { id } = useParams();
  const cuarentenaId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Editar cuarentena" items={breadcrumbs.cuarentenaEditar} />
      <ComponentCard title="Editar cuarentena en proceso">
        <CuarentenaForm cuarentenaId={cuarentenaId} />
      </ComponentCard>
    </div>
  );
}
