export interface CategoriaAnimal {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface CategoriaAnimalCreateRequest {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
}

export interface CategoriaAnimalUpdateRequest extends CategoriaAnimalCreateRequest {}

export interface CategoriaAnimalListParams {
  page?: number;
  per_page?: number;
  search?: string;
  activo?: boolean;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
