export interface CategoriaAnimalRegla {
  nombre: string;
  descripcion: string;
  sexo: "M" | "H" | null;
  edad_min_meses: number;
  edad_max_meses: number | null;
  castrado: boolean | null;
  condicion: string;
}

export interface CategoriaAnimal {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  regla?: CategoriaAnimalRegla | null;
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
