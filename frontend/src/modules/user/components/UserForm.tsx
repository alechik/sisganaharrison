import { useState } from "react";

import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";

import { createUser } from "../services/userService";

export default function UserForm() {

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: "",
  });

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

      </div>

      <div className="mt-6">
        <Button size="sm">
          Guardar Usuario
        </Button>
      </div>

    </form>
  );
}