import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  Tarea,
  TareaCreateRequest,
  TareaListParams,
  TareaUpdateRequest,
  TareaUsuario,
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

export const getTareas = async (
  params: TareaListParams = {},
  signal?: AbortSignal
): Promise<PaginatedResponse<Tarea>> => {
  const response = await api.get<LaravelPaginatedResponse<Tarea>>("/tareas", {
    signal,
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      search: params.search || undefined,
      estado: params.estado || undefined,
      user_trabajador_id: params.user_trabajador_id || undefined,
      fecha_desde: params.fecha_desde || undefined,
      fecha_hasta: params.fecha_hasta || undefined,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });

  const body = response.data;
  return mapPaginated({
    data: Array.isArray(body.data) ? body.data : [],
    meta: body.meta,
    links: body.links,
  });
};

export const getTarea = async (id: number): Promise<Tarea> => {
  const response = await api.get<{ data: Tarea }>(`/tareas/${id}`);
  return response.data.data;
};

export const getAsignables = async (): Promise<TareaUsuario[]> => {
  const response = await api.get<{ data?: TareaUsuario[] } | TareaUsuario[]>("/tareas/asignables");
  const payload = response.data;
  if (Array.isArray(payload)) {
    return payload;
  }
  return Array.isArray(payload.data) ? payload.data : [];
};

export const createTarea = async (data: TareaCreateRequest) => {
  const response = await api.post<{ message: string; data: Tarea }>("/tareas", data);
  return response.data;
};

export const updateTarea = async (id: number, data: TareaUpdateRequest) => {
  const response = await api.put<{ message: string; data: Tarea }>(`/tareas/${id}`, data);
  return response.data;
};

export const terminarTarea = async (id: number) => {
  const response = await api.patch<{ message: string; data: Tarea }>(`/tareas/${id}/terminar`);
  return response.data;
};
