import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  Parcela,
  ParcelaCreateRequest,
  ParcelaListParams,
  ParcelaUpdateRequest,
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

export const getParcelas = async (
  params: ParcelaListParams = {},
  signal?: AbortSignal
): Promise<PaginatedResponse<Parcela>> => {
  const response = await api.get<LaravelPaginatedResponse<Parcela>>("/parcelas", {
    signal,
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      search: params.search || undefined,
      estancia_id: params.estancia_id || undefined,
      activo: params.activo,
      disponibilidad: params.disponibilidad,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });

  return mapPaginated(response.data);
};

export const getDeletedParcelas = async (
  params: Pick<ParcelaListParams, "page" | "per_page" | "sort_by" | "sort_dir" | "estancia_id"> = {},
  signal?: AbortSignal
): Promise<PaginatedResponse<Parcela>> => {
  const response = await api.get<LaravelPaginatedResponse<Parcela>>(
    "/parcelas/eliminados",
    {
      signal,
      params: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 10,
        estancia_id: params.estancia_id || undefined,
        sort_by: params.sort_by,
        sort_dir: params.sort_dir,
      },
    }
  );

  return mapPaginated(response.data);
};

export const getParcela = async (id: number): Promise<Parcela> => {
  const response = await api.get<{ data: Parcela }>(`/parcelas/${id}`);
  return response.data.data;
};

export const createParcela = async (data: ParcelaCreateRequest) => {
  const response = await api.post<{ message: string; data: Parcela }>("/parcelas", data);
  return response.data;
};

export const updateParcela = async (id: number, data: ParcelaUpdateRequest) => {
  const response = await api.put<{ message: string; data: Parcela }>(`/parcelas/${id}`, data);
  return response.data;
};

export const deleteParcela = async (id: number) => {
  const response = await api.delete<{ message: string }>(`/parcelas/${id}`);
  return response.data;
};

export const changeParcelaStatus = async (id: number) => {
  const response = await api.patch<{ message: string; data: Parcela }>(`/parcelas/${id}/estado`);
  return response.data;
};

export const restoreParcela = async (id: number) => {
  const response = await api.post<{ message: string; data: Parcela }>(`/parcelas/${id}/restaurar`);
  return response.data;
};
