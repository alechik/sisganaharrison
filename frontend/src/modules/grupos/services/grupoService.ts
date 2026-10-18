import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import { Grupo, GrupoCreateRequest, GrupoListParams, GrupoUpdateRequest } from "../types";

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

export const getGrupos = async (
  params: GrupoListParams = {},
  signal?: AbortSignal
): Promise<PaginatedResponse<Grupo>> => {
  const response = await api.get<LaravelPaginatedResponse<Grupo>>("/grupos", {
    signal,
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      search: params.search || undefined,
      lote_id: params.lote_id || undefined,
      activo: params.activo,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });

  return mapPaginated(response.data);
};

export const getDeletedGrupos = async (
  params: Pick<GrupoListParams, "page" | "per_page" | "sort_by" | "sort_dir" | "lote_id"> = {},
  signal?: AbortSignal
): Promise<PaginatedResponse<Grupo>> => {
  const response = await api.get<LaravelPaginatedResponse<Grupo>>("/grupos/eliminados", {
    signal,
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      lote_id: params.lote_id || undefined,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });

  return mapPaginated(response.data);
};

export const getGrupo = async (id: number): Promise<Grupo> => {
  const response = await api.get<{ data: Grupo }>(`/grupos/${id}`);
  return response.data.data;
};

export const createGrupo = async (data: GrupoCreateRequest) => {
  const response = await api.post<{ message: string; data: Grupo }>("/grupos", data);
  return response.data;
};

export const updateGrupo = async (id: number, data: GrupoUpdateRequest) => {
  const response = await api.put<{ message: string; data: Grupo }>(`/grupos/${id}`, data);
  return response.data;
};

export const deleteGrupo = async (id: number) => {
  const response = await api.delete<{ message: string }>(`/grupos/${id}`);
  return response.data;
};

export const changeGrupoStatus = async (id: number) => {
  const response = await api.patch<{ message: string; data: Grupo }>(`/grupos/${id}/estado`);
  return response.data;
};

export const restoreGrupo = async (id: number) => {
  const response = await api.post<{ message: string; data: Grupo }>(`/grupos/${id}/restaurar`);
  return response.data;
};
