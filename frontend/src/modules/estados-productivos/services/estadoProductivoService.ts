import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  EstadoProductivo,
  EstadoProductivoCreateRequest,
  EstadoProductivoListParams,
  EstadoProductivoUpdateRequest,
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

export const getEstadosProductivos = async (
  params: EstadoProductivoListParams = {}
): Promise<PaginatedResponse<EstadoProductivo>> => {
  const response = await api.get<LaravelPaginatedResponse<EstadoProductivo>>(
    "/estados-productivos",
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

export const getDeletedEstadosProductivos = async (
  params: Pick<EstadoProductivoListParams, "page" | "per_page" | "sort_by" | "sort_dir"> = {}
): Promise<PaginatedResponse<EstadoProductivo>> => {
  const response = await api.get<LaravelPaginatedResponse<EstadoProductivo>>(
    "/estados-productivos/eliminados",
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

export const getEstadoProductivo = async (id: number): Promise<EstadoProductivo> => {
  const response = await api.get<{ data: EstadoProductivo }>(
    `/estados-productivos/${id}`
  );
  return response.data.data;
};

export const createEstadoProductivo = async (data: EstadoProductivoCreateRequest) => {
  const response = await api.post<{ message: string; data: EstadoProductivo }>(
    "/estados-productivos",
    data
  );
  return response.data;
};

export const updateEstadoProductivo = async (
  id: number,
  data: EstadoProductivoUpdateRequest
) => {
  const response = await api.put<{ message: string; data: EstadoProductivo }>(
    `/estados-productivos/${id}`,
    data
  );
  return response.data;
};

export const deleteEstadoProductivo = async (id: number) => {
  const response = await api.delete<{ message: string }>(`/estados-productivos/${id}`);
  return response.data;
};

export const changeEstadoProductivoStatus = async (id: number) => {
  const response = await api.patch<{ message: string; data: EstadoProductivo }>(
    `/estados-productivos/${id}/estado`
  );
  return response.data;
};

export const restoreEstadoProductivo = async (id: number) => {
  const response = await api.post<{ message: string; data: EstadoProductivo }>(
    `/estados-productivos/${id}/restaurar`
  );
  return response.data;
};
