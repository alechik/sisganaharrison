import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import { Almacen, AlmacenCreateRequest, AlmacenListParams } from "../types";

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

export const getAlmacenes = async (params: AlmacenListParams = {}, signal?: AbortSignal) => {
  const response = await api.get<LaravelPaginatedResponse<Almacen>>("/almacenes", {
    signal,
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      search: params.search || undefined,
      establecimiento_id: params.establecimiento_id,
      activo: params.activo,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });
  return mapPaginated(response.data);
};

export const getDeletedAlmacenes = async (
  params: Pick<AlmacenListParams, "page" | "per_page" | "sort_by" | "sort_dir"> = {},
  signal?: AbortSignal
) => {
  const response = await api.get<LaravelPaginatedResponse<Almacen>>("/almacenes/eliminados", {
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

export const getAlmacen = async (id: number) =>
  (await api.get<{ data: Almacen }>(`/almacenes/${id}`)).data.data;

export const createAlmacen = async (data: AlmacenCreateRequest) =>
  (await api.post<{ message: string; data: Almacen }>("/almacenes", data)).data;

export const updateAlmacen = async (id: number, data: AlmacenCreateRequest) =>
  (await api.put<{ message: string; data: Almacen }>(`/almacenes/${id}`, data)).data;

export const deleteAlmacen = async (id: number) =>
  (await api.delete<{ message: string }>(`/almacenes/${id}`)).data;

export const restoreAlmacen = async (id: number) =>
  (await api.post<{ message: string; data: Almacen }>(`/almacenes/${id}/restaurar`)).data;

export const toggleAlmacenStatus = async (id: number) =>
  (await api.patch<{ message: string; data: Almacen }>(`/almacenes/${id}/estado`)).data;
