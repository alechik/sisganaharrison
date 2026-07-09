import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  Potrero,
  PotreroCreateRequest,
  PotreroListParams,
  PotreroUpdateRequest,
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

export const getPotreros = async (
  params: PotreroListParams = {}
): Promise<PaginatedResponse<Potrero>> => {
  const response = await api.get<LaravelPaginatedResponse<Potrero>>("/potreros", {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      search: params.search || undefined,
      establecimiento_id: params.establecimiento_id || undefined,
      activo: params.activo,
      disponibilidad: params.disponibilidad,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });

  return mapPaginated(response.data);
};

export const getDeletedPotreros = async (
  params: Pick<PotreroListParams, "page" | "per_page" | "sort_by" | "sort_dir" | "establecimiento_id"> = {}
): Promise<PaginatedResponse<Potrero>> => {
  const response = await api.get<LaravelPaginatedResponse<Potrero>>(
    "/potreros/eliminados",
    {
      params: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 10,
        establecimiento_id: params.establecimiento_id || undefined,
        sort_by: params.sort_by,
        sort_dir: params.sort_dir,
      },
    }
  );

  return mapPaginated(response.data);
};

export const getPotrero = async (id: number): Promise<Potrero> => {
  const response = await api.get<{ data: Potrero }>(`/potreros/${id}`);
  return response.data.data;
};

export const createPotrero = async (data: PotreroCreateRequest) => {
  const response = await api.post<{ message: string; data: Potrero }>("/potreros", data);
  return response.data;
};

export const updatePotrero = async (id: number, data: PotreroUpdateRequest) => {
  const response = await api.put<{ message: string; data: Potrero }>(`/potreros/${id}`, data);
  return response.data;
};

export const deletePotrero = async (id: number) => {
  const response = await api.delete<{ message: string }>(`/potreros/${id}`);
  return response.data;
};

export const changePotreroStatus = async (id: number) => {
  const response = await api.patch<{ message: string; data: Potrero }>(`/potreros/${id}/estado`);
  return response.data;
};

export const restorePotrero = async (id: number) => {
  const response = await api.post<{ message: string; data: Potrero }>(`/potreros/${id}/restaurar`);
  return response.data;
};
