
import { breadcrumbs } from "@/config/breadcrumbs";
import UserTable from "../components/UserTable";
import { useUsers } from "../hooks/useUsers";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

const UserList = () => {
  const { users, loading } = useUsers();

  if (loading) {
    return <div>Cargando usuarios...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Lista de Usuarios
        </h1>
        <PageBreadCrumb
          pageTitle="Usuarios"
          items={breadcrumbs.usuarios}
        />
      </div>

      <UserTable users={users} />
    </div>
  );
};

export default UserList;