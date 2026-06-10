import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

import UserForm from "../components/UserForm";
import { breadcrumbs } from "@/config/breadcrumbs";

export default function UserCreate() {

  return (
    <div>

        <PageBreadCrumb
          pageTitle="Nuevo Usuario"
          items={breadcrumbs.usuarioCrear}
        />

      <ComponentCard title="Formulario Usuario">

        <UserForm />

      </ComponentCard>

    </div>
  );

}