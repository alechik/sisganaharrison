import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  Animal,
  AnimalCreateRequest,
  AnimalListParams,
  AnimalUpdateRequest,
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

export const getAnimales = async (
  params: AnimalListParams = {}
): Promise<PaginatedResponse<Animal>> => {
  const response = await api.get<LaravelPaginatedResponse<Animal>>("/animales", {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      search: params.search || undefined,
      raza_id: params.raza_id || undefined,
      categoria_id: params.categoria_id || undefined,
      estado_productivo_id: params.estado_productivo_id || undefined,
      lote_id: params.lote_id || undefined,
      sexo: params.sexo || undefined,
      activo: params.activo,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });

  return mapPaginated(response.data);
};

export const getDeletedAnimales = async (
  params: Pick<
    AnimalListParams,
    "page" | "per_page" | "sort_by" | "sort_dir" | "lote_id" | "raza_id"
  > = {}
): Promise<PaginatedResponse<Animal>> => {
  const response = await api.get<LaravelPaginatedResponse<Animal>>(
    "/animales/eliminados",
    {
      params: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 10,
        lote_id: params.lote_id || undefined,
        raza_id: params.raza_id || undefined,
        sort_by: params.sort_by,
        sort_dir: params.sort_dir,
      },
    }
  );

  return mapPaginated(response.data);
};

export const getAnimal = async (id: number): Promise<Animal> => {
  const response = await api.get<{ data: Animal }>(`/animales/${id}`);
  return response.data.data;
};

export const createAnimal = async (data: AnimalCreateRequest) => {
  const response = await api.post<{ message: string; data: Animal }>("/animales", data);
  return response.data;
};

export const updateAnimal = async (id: number, data: AnimalUpdateRequest) => {
  const response = await api.put<{ message: string; data: Animal }>(`/animales/${id}`, data);
  return response.data;
};

export const deleteAnimal = async (id: number) => {
  const response = await api.delete<{ message: string }>(`/animales/${id}`);
  return response.data;
};

export const changeAnimalStatus = async (id: number) => {
  const response = await api.patch<{ message: string; data: Animal }>(
    `/animales/${id}/estado`
  );
  return response.data;
};

export const restoreAnimal = async (id: number) => {
  const response = await api.post<{ message: string; data: Animal }>(
    `/animales/${id}/restaurar`
  );
  return response.data;
};

export const getSiguienteCodigoAnimal = async (categoriaId: number): Promise<string> => {
  const response = await api.get<{ data: { codigo: string } }>("/animales/siguiente-codigo", {
    params: { categoria_id: categoriaId },
  });
  return response.data.data.codigo;
};
