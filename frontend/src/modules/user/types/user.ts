export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  estado: boolean;
  roles: Role[];
}