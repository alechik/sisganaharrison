import { useParams } from "react-router-dom";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { breadcrumbs } from "@/config/breadcrumbs";
import UserForm from "../components/UserForm";

export default function UserEdit() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);

  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Editar Usuario"
        items={breadcrumbs.usuarioEditar}
      />

      <ComponentCard title="Formulario Usuario">
        <UserForm userId={userId} />
      </ComponentCard>
    </div>
  );
}
