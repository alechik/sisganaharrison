import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  Estancia,
  EstanciaCreateRequest,
  EstanciaListParams,
  EstanciaUpdateRequest,
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

export const getEstancias = async (
  params: EstanciaListParams = {},
  signal?: AbortSignal
): Promise<PaginatedResponse<Estancia>> => {
  const response = await api.get<LaravelPaginatedResponse<Estancia>>(
    "/estancias",
    {
      signal,
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

export const getDeletedEstancias = async (
  params: Pick<EstanciaListParams, "page" | "per_page" | "sort_by" | "sort_dir"> = {},
  signal?: AbortSignal
): Promise<PaginatedResponse<Estancia>> => {
  const response = await api.get<LaravelPaginatedResponse<Estancia>>(
    "/estancias/eliminados",
    {
      signal,
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

export const getEstancia = async (id: number): Promise<Estancia> => {
  const response = await api.get<{ data: Estancia }>(
    `/estancias/${id}`
  );
  return response.data.data;
};

export const createEstancia = async (data: EstanciaCreateRequest) => {
  const response = await api.post<{ message: string; data: Estancia }>(
    "/estancias",
    data
  );
  return response.data;
};

export const updateEstancia = async (
  id: number,
  data: EstanciaUpdateRequest
) => {
  const response = await api.put<{ message: string; data: Estancia }>(
    `/estancias/${id}`,
    data
  );
  return response.data;
};

export const deleteEstancia = async (id: number) => {
  const response = await api.delete<{ message: string }>(`/estancias/${id}`);
  return response.data;
};

export const changeEstanciaStatus = async (id: number) => {
  const response = await api.patch<{ message: string; data: Estancia }>(
    `/estancias/${id}/estado`
  );
  return response.data;
};

export const restoreEstancia = async (id: number) => {
  const response = await api.post<{ message: string; data: Estancia }>(
    `/estancias/${id}/restaurar`
  );
  return response.data;
};
