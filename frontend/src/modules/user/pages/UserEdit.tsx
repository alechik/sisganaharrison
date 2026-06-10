import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

import UserForm from "../components/UserForm";

export default function UserEdit() {

  return (
    <div>

      <PageBreadCrumb
        pageTitle="Editar Usuario"
        items={[
          {
            title: "Gestión de Personal",
            path: "/",
          },
          {
            title: "Usuarios",
            path: "/usuarios",
          },
          {
            title: "Editar Usuario",
          },
        ]}
      />

      <ComponentCard title="Formulario Usuario">

        <UserForm />

      </ComponentCard>

    </div>
  );

}