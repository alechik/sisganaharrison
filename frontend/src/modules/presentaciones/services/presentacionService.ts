import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  Presentacion,
  PresentacionCreateRequest,
  PresentacionListParams,
  PresentacionUpdateRequest,
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

export const getPresentaciones = async (
  params: PresentacionListParams = {}
): Promise<PaginatedResponse<Presentacion>> => {
  const response = await api.get<LaravelPaginatedResponse<Presentacion>>(
    "/presentaciones",
    {
      params: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 10,
        search: params.search || undefined,
        sort_by: params.sort_by,
        sort_dir: params.sort_dir,
      },
    }
  );

  return mapPaginated(response.data);
};

export const getDeletedPresentaciones = async (
  params: Pick<PresentacionListParams, "page" | "per_page" | "sort_by" | "sort_dir"> = {}
): Promise<PaginatedResponse<Presentacion>> => {
  const response = await api.get<LaravelPaginatedResponse<Presentacion>>(
    "/presentaciones/eliminados",
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

export const getPresentacion = async (id: number): Promise<Presentacion> => {
  const response = await api.get<{ data: Presentacion }>(`/presentaciones/${id}`);
  return response.data.data;
};

export const createPresentacion = async (data: PresentacionCreateRequest) => {
  const response = await api.post<{ message: string; data: Presentacion }>(
    "/presentaciones",
    data
  );
  return response.data;
};

export const updatePresentacion = async (id: number, data: PresentacionUpdateRequest) => {
  const response = await api.put<{ message: string; data: Presentacion }>(
    `/presentaciones/${id}`,
    data
  );
  return response.data;
};

export const deletePresentacion = async (id: number) => {
  const response = await api.delete<{ message: string }>(`/presentaciones/${id}`);
  return response.data;
};

export const restorePresentacion = async (id: number) => {
  const response = await api.post<{ message: string; data: Presentacion }>(
    `/presentaciones/${id}/restaurar`
  );
  return response.data;
};
