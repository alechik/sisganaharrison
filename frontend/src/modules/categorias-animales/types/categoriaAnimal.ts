export interface CategoriaAnimalRegla {
  nombre: string;
  descripcion: string;
  sexo: "M" | "H" | null;
  edad_min_meses: number;
  edad_max_meses: number | null;
  castrado: boolean | null;
  condicion: string;
  caracteristica?: string | null;
  peso_min_kg?: number | null;
  peso_max_kg?: number | null;
  peso_referencia_meses?: number | null;
  cambio_peso_meses?: number | null;
  indice_aumento?: number | null;
}

export interface CategoriaAnimal {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  sexo?: "M" | "H" | null;
  edad_min_meses?: number | null;
  edad_max_meses?: number | null;
  castrado?: boolean | null;
  caracteristica?: string | null;
  peso_min_kg?: number | null;
  peso_max_kg?: number | null;
  peso_referencia_meses?: number | null;
  cambio_peso_meses?: number | null;
  indice_aumento?: number | null;
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
  sexo?: "M" | "H" | null;
  edad_min_meses?: number | null;
  edad_max_meses?: number | null;
  castrado?: boolean | null;
  caracteristica?: string | null;
  peso_min_kg?: number | null;
  peso_max_kg?: number | null;
  peso_referencia_meses?: number | null;
  cambio_peso_meses?: number | null;
  indice_aumento?: number | null;
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
