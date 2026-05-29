import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

import UserForm from "../components/UserForm";

export default function UserCreate() {

  return (
    <div>

      <PageBreadCrumb pageTitle="Crear Usuario" />

      <ComponentCard title="Formulario Usuario">

        <UserForm />

      </ComponentCard>

    </div>
  );

}