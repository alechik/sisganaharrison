import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  Gestacion,
  GestacionCreateRequest,
  GestacionListParams,
  GestacionUpdateRequest,
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

export const getGestaciones = async (
  params: GestacionListParams = {}
): Promise<PaginatedResponse<Gestacion>> => {
  const response = await api.get<LaravelPaginatedResponse<Gestacion>>("/gestaciones", {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      search: params.search || undefined,
      servicio_id: params.servicio_id || undefined,
      estado: params.estado || undefined,
      fecha_confirmacion_desde: params.fecha_confirmacion_desde || undefined,
      fecha_confirmacion_hasta: params.fecha_confirmacion_hasta || undefined,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });

  return mapPaginated(response.data);
};

export const getGestacion = async (id: number): Promise<Gestacion> => {
  const response = await api.get<{ data: Gestacion }>(`/gestaciones/${id}`);
  return response.data.data;
};

export const createGestacion = async (data: GestacionCreateRequest) => {
  const response = await api.post<{ message: string; data: Gestacion }>("/gestaciones", data);
  return response.data;
};

export const updateGestacion = async (id: number, data: GestacionUpdateRequest) => {
  const response = await api.put<{ message: string; data: Gestacion }>(
    `/gestaciones/${id}`,
    data
  );
  return response.data;
};
