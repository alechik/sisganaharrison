import { useState, useEffect } from "react";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";

import { createUser, getRoles } from "../services/userService";
import { Role } from "../types/role";
import { UserCreateRequest } from "../types/user";
import Select from "@/components/form/Select";

export default function UserForm() {

  const [form, setForm] =
    useState<UserCreateRequest>({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      password: "",
      roles: [],
    });

  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    const loadRoles = async () => {
      const data = await getRoles();
      setRoles(data);
    };
    loadRoles();
  }, []);

  const roleOptions = roles.map((role) => ({
    value: role.name,
    label: role.name,
  }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      await createUser(form);

      alert("Usuario registrado");

      setForm({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        password: "",
        roles: [],
      });

    } catch (error) {

      console.error(error);

    }

  };

  return (
    <form onSubmit={handleSubmit}>

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
          <Label>Password</Label>

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

      <div className="mt-6">
        <Button size="sm">
          Guardar Usuario
        </Button>
      </div>

    </form>
  );
}