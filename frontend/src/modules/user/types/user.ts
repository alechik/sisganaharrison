import { Role } from "./role";

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  estado: boolean;
  roles: Role[];
}

export interface UserCreateRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
  roles: string[];
}

export interface UserUpdateRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password?: string;
  roles: string[];
}

export interface UserListParams {
  page?: number;
  per_page?: number;
  search?: string;
  estado?: boolean;
}
