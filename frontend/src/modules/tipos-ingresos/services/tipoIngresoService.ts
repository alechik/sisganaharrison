import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  TipoIngreso,
  TipoIngresoCreateRequest,
  TipoIngresoListParams,
  TipoIngresoUpdateRequest,
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

export const getTiposIngresos = async (
  params: TipoIngresoListParams = {},
  signal?: AbortSignal
): Promise<PaginatedResponse<TipoIngreso>> => {
  const response = await api.get<LaravelPaginatedResponse<TipoIngreso>>("/tipos-ingresos", {
    signal,
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

export const getDeletedTiposIngresos = async (
  params: Pick<TipoIngresoListParams, "page" | "per_page" | "sort_by" | "sort_dir"> = {},
  signal?: AbortSignal
): Promise<PaginatedResponse<TipoIngreso>> => {
  const response = await api.get<LaravelPaginatedResponse<TipoIngreso>>("/tipos-ingresos/eliminados", {
    signal,
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });

  return mapPaginated(response.data);
};

export const getTipoIngreso = async (id: number): Promise<TipoIngreso> => {
  const response = await api.get<{ data: TipoIngreso }>(`/tipos-ingresos/${id}`);
  return response.data.data;
};

export const createTipoIngreso = async (data: TipoIngresoCreateRequest) => {
  const response = await api.post<{ message: string; data: TipoIngreso }>("/tipos-ingresos", data);
  return response.data;
};

export const updateTipoIngreso = async (id: number, data: TipoIngresoUpdateRequest) => {
  const response = await api.put<{ message: string; data: TipoIngreso }>(`/tipos-ingresos/${id}`, data);
  return response.data;
};

export const deleteTipoIngreso = async (id: number) => {
  const response = await api.delete<{ message: string }>(`/tipos-ingresos/${id}`);
  return response.data;
};

export const changeTipoIngresoStatus = async (id: number) => {
  const response = await api.patch<{ message: string; data: TipoIngreso }>(`/tipos-ingresos/${id}/estado`);
  return response.data;
};

export const restoreTipoIngreso = async (id: number) => {
  const response = await api.post<{ message: string; data: TipoIngreso }>(`/tipos-ingresos/${id}/restaurar`);
  return response.data;
};
