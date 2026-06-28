import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  Raza,
  RazaCreateRequest,
  RazaListParams,
  RazaUpdateRequest,
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

export const getRazas = async (
  params: RazaListParams = {}
): Promise<PaginatedResponse<Raza>> => {
  const response = await api.get<LaravelPaginatedResponse<Raza>>("/razas", {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      search: params.search || undefined,
      estado: params.estado,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });

  return mapPaginated(response.data);
};

export const getDeletedRazas = async (
  params: Pick<RazaListParams, "page" | "per_page" | "sort_by" | "sort_dir"> = {}
): Promise<PaginatedResponse<Raza>> => {
  const response = await api.get<LaravelPaginatedResponse<Raza>>("/razas/eliminados", {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });

  return mapPaginated(response.data);
};

export const getRaza = async (id: number): Promise<Raza> => {
  const response = await api.get<{ data: Raza }>(`/razas/${id}`);
  return response.data.data;
};

export const createRaza = async (data: RazaCreateRequest) => {
  const response = await api.post<{ message: string; data: Raza }>("/razas", data);
  return response.data;
};

export const updateRaza = async (id: number, data: RazaUpdateRequest) => {
  const response = await api.put<{ message: string; data: Raza }>(`/razas/${id}`, data);
  return response.data;
};

export const deleteRaza = async (id: number) => {
  const response = await api.delete<{ message: string }>(`/razas/${id}`);
  return response.data;
};

export const changeRazaStatus = async (id: number) => {
  const response = await api.patch<{ message: string; data: Raza }>(`/razas/${id}/estado`);
  return response.data;
};

export const restoreRaza = async (id: number) => {
  const response = await api.post<{ message: string; data: Raza }>(`/razas/${id}/restaurar`);
  return response.data;
};
