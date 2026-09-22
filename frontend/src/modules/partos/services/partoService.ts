import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  Parto,
  PartoCreateRequest,
  PartoListParams,
  PartoUpdateRequest,
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

export const getPartos = async (
  params: PartoListParams = {}
): Promise<PaginatedResponse<Parto>> => {
  const response = await api.get<LaravelPaginatedResponse<Parto>>("/partos", {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      search: params.search || undefined,
      gestacion_id: params.gestacion_id || undefined,
      estado: params.estado || undefined,
      incluir_id: params.incluir_id || undefined,
      fecha_parto_desde: params.fecha_parto_desde || undefined,
      fecha_parto_hasta: params.fecha_parto_hasta || undefined,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });

  return mapPaginated(response.data);
};

export const getParto = async (id: number): Promise<Parto> => {
  const response = await api.get<{ data: Parto }>(`/partos/${id}`);
  return response.data.data;
};

export const createParto = async (data: PartoCreateRequest) => {
  const response = await api.post<{ message: string; data: Parto }>("/partos", data);
  return response.data;
};

export const updateParto = async (id: number, data: PartoUpdateRequest) => {
  const response = await api.put<{ message: string; data: Parto }>(`/partos/${id}`, data);
  return response.data;
};

export const finalizarParto = async (id: number) => {
  const response = await api.patch<{ message: string; data: Parto }>(`/partos/${id}/estado`);
  return response.data;
};
