import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  TipoSalida,
  TipoSalidaCreateRequest,
  TipoSalidaListParams,
  TipoSalidaUpdateRequest,
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

export const getTiposSalidas = async (
  params: TipoSalidaListParams = {}
): Promise<PaginatedResponse<TipoSalida>> => {
  const response = await api.get<LaravelPaginatedResponse<TipoSalida>>(
    "/tipos-salidas",
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

export const getDeletedTiposSalidas = async (
  params: Pick<TipoSalidaListParams, "page" | "per_page" | "sort_by" | "sort_dir"> = {}
): Promise<PaginatedResponse<TipoSalida>> => {
  const response = await api.get<LaravelPaginatedResponse<TipoSalida>>(
    "/tipos-salidas/eliminados",
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

export const getTipoSalida = async (id: number): Promise<TipoSalida> => {
  const response = await api.get<{ data: TipoSalida }>(`/tipos-salidas/${id}`);
  return response.data.data;
};

export const createTipoSalida = async (data: TipoSalidaCreateRequest) => {
  const response = await api.post<{ message: string; data: TipoSalida }>(
    "/tipos-salidas",
    data
  );
  return response.data;
};

export const updateTipoSalida = async (id: number, data: TipoSalidaUpdateRequest) => {
  const response = await api.put<{ message: string; data: TipoSalida }>(
    `/tipos-salidas/${id}`,
    data
  );
  return response.data;
};

export const deleteTipoSalida = async (id: number) => {
  const response = await api.delete<{ message: string }>(`/tipos-salidas/${id}`);
  return response.data;
};

export const restoreTipoSalida = async (id: number) => {
  const response = await api.post<{ message: string; data: TipoSalida }>(
    `/tipos-salidas/${id}/restaurar`
  );
  return response.data;
};
