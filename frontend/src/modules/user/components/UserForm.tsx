import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";

import {
  createUser,
  getRoles,
  getUser,
  updateUser,
} from "../services/userService";
import { Role } from "../types/role";
import { UserCreateRequest, UserUpdateRequest } from "../types/user";

interface Props {
  userId?: number;
}

const emptyForm: UserCreateRequest = {
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  password: "",
  roles: [],
};

export default function UserForm({ userId }: Props) {
  const navigate = useNavigate();
  const isEdit = Boolean(userId);

  const [form, setForm] = useState<UserCreateRequest>(emptyForm);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rolesData = await getRoles();
        setRoles(rolesData);

        if (userId) {
          const user = await getUser(userId);
          setForm({
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            telefono: user.telefono ?? "",
            password: "",
            roles: user.roles.map((role) => role.name),
          });
        }
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el formulario.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isEdit && userId) {
        const payload: UserUpdateRequest = {
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          telefono: form.telefono,
          roles: form.roles,
        };

        if (form.password) {
          payload.password = form.password;
        }

        await updateUser(userId, payload);
      } else {
        await createUser(form);
      }

      navigate("/usuarios");
    } catch (err: unknown) {
      console.error(err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "No se pudo guardar el usuario.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Cargando formulario...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Nombres</Label>
          <InputField
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Apellidos</Label>
          <InputField
            type="text"
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Email</Label>
          <InputField
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Teléfono</Label>
          <InputField
            type="text"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>{isEdit ? "Nueva contraseña (opcional)" : "Contraseña"}</Label>
          <InputField
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Rol</Label>
          <Select
            value={form.roles[0] || ""}
            placeholder="Seleccione un rol"
            options={roles.map((role) => ({
              value: role.name,
              label: role.name,
            }))}
            onChange={(value) =>
              setForm({
                ...form,
                roles: [value],
              })
            }
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button size="sm" type="submit" disabled={saving}>
          {saving ? "Guardando..." : isEdit ? "Actualizar Usuario" : "Guardar Usuario"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => navigate("/usuarios")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
