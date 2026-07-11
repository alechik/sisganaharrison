import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  Lote,
  LoteCreateRequest,
  LoteListParams,
  LoteUpdateRequest,
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

export const getLotes = async (
  params: LoteListParams = {}
): Promise<PaginatedResponse<Lote>> => {
  const response = await api.get<LaravelPaginatedResponse<Lote>>("/lotes", {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      search: params.search || undefined,
      potrero_id: params.potrero_id || undefined,
      activo: params.activo,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });

  return mapPaginated(response.data);
};

export const getDeletedLotes = async (
  params: Pick<LoteListParams, "page" | "per_page" | "sort_by" | "sort_dir" | "potrero_id"> = {}
): Promise<PaginatedResponse<Lote>> => {
  const response = await api.get<LaravelPaginatedResponse<Lote>>(
    "/lotes/eliminados",
    {
      params: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 10,
        potrero_id: params.potrero_id || undefined,
        sort_by: params.sort_by,
        sort_dir: params.sort_dir,
      },
    }
  );

  return mapPaginated(response.data);
};

export const getLote = async (id: number): Promise<Lote> => {
  const response = await api.get<{ data: Lote }>(`/lotes/${id}`);
  return response.data.data;
};

export const createLote = async (data: LoteCreateRequest) => {
  const response = await api.post<{ message: string; data: Lote }>("/lotes", data);
  return response.data;
};

export const updateLote = async (id: number, data: LoteUpdateRequest) => {
  const response = await api.put<{ message: string; data: Lote }>(`/lotes/${id}`, data);
  return response.data;
};

export const deleteLote = async (id: number) => {
  const response = await api.delete<{ message: string }>(`/lotes/${id}`);
  return response.data;
};

export const changeLoteStatus = async (id: number) => {
  const response = await api.patch<{ message: string; data: Lote }>(`/lotes/${id}/estado`);
  return response.data;
};

export const restoreLote = async (id: number) => {
  const response = await api.post<{ message: string; data: Lote }>(`/lotes/${id}/restaurar`);
  return response.data;
};
