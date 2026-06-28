import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  CategoriaAnimal,
  CategoriaAnimalCreateRequest,
  CategoriaAnimalListParams,
  CategoriaAnimalUpdateRequest,
} from "../types";

interface LaravelPaginatedResponse<T> {
  data: T[];
  meta: PaginatedResponse<T>["meta"];
  links: PaginatedResponse<T>["links"];
}

const mapPaginated = <T>(response: LaravelPaginatedResponse<T>): PaginatedResponse<T> => ({
  data: response.data,
  meta: response.meta,
  links: response.links,
});

export const getCategoriasAnimales = async (
  params: CategoriaAnimalListParams = {}
): Promise<PaginatedResponse<CategoriaAnimal>> => {
  const response = await api.get<LaravelPaginatedResponse<CategoriaAnimal>>(
    "/categorias-animales",
    {
      params: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 10,
        search: params.search || undefined,
        activo: params.activo,
        sort_by: params.sort_by,
        sort_dir: params.sort_dir,
      },
    }
  );

  return mapPaginated(response.data);
};

export const getDeletedCategoriasAnimales = async (
  params: Pick<CategoriaAnimalListParams, "page" | "per_page" | "sort_by" | "sort_dir"> = {}
): Promise<PaginatedResponse<CategoriaAnimal>> => {
  const response = await api.get<LaravelPaginatedResponse<CategoriaAnimal>>(
    "/categorias-animales/eliminados",
    {
      params: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 10,
        sort_by: params.sort_by,
        sort_dir: params.sort_dir,
      },
    }
  );

  return mapPaginated(response.data);
};

export const getCategoriaAnimal = async (id: number): Promise<CategoriaAnimal> => {
  const response = await api.get<{ data: CategoriaAnimal }>(`/categorias-animales/${id}`);
  return response.data.data;
};

export const createCategoriaAnimal = async (data: CategoriaAnimalCreateRequest) => {
  const response = await api.post<{ message: string; data: CategoriaAnimal }>(
    "/categorias-animales",
    data
  );
  return response.data;
};

export const updateCategoriaAnimal = async (
  id: number,
  data: CategoriaAnimalUpdateRequest
) => {
  const response = await api.put<{ message: string; data: CategoriaAnimal }>(
    `/categorias-animales/${id}`,
    data
  );
  return response.data;
};

export const deleteCategoriaAnimal = async (id: number) => {
  const response = await api.delete<{ message: string }>(`/categorias-animales/${id}`);
  return response.data;
};

export const changeCategoriaAnimalStatus = async (id: number) => {
  const response = await api.patch<{ message: string; data: CategoriaAnimal }>(
    `/categorias-animales/${id}/estado`
  );
  return response.data;
};

export const restoreCategoriaAnimal = async (id: number) => {
  const response = await api.post<{ message: string; data: CategoriaAnimal }>(
    `/categorias-animales/${id}/restaurar`
  );
  return response.data;
};
