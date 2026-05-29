import UserTable from "../components/UserTable";
import { useUsers } from "../hooks/useUsers";

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
      </div>

      <UserTable users={users} />
    </div>
  );
};

export default UserList;