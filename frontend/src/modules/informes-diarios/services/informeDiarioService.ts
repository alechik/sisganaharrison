import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  InformeDiario,
  InformeDiarioCreateRequest,
  InformeDiarioListParams,
  InformeDiarioUpdateRequest,
  InformePendiente,
  InformeUsuario,
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

export const getInformesDiarios = async (
  params: InformeDiarioListParams = {},
  signal?: AbortSignal
): Promise<PaginatedResponse<InformeDiario>> => {
  const response = await api.get<LaravelPaginatedResponse<InformeDiario>>("/informes-diarios", {
    signal,
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      search: params.search || undefined,
      revisado: params.revisado || undefined,
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

export const getInformeDiario = async (id: number): Promise<InformeDiario> => {
  const response = await api.get<{ data: InformeDiario }>(`/informes-diarios/${id}`);
  return response.data.data;
};

export const getInformesPendientes = async (): Promise<{ total: number; data: InformePendiente[] }> => {
  const response = await api.get<{ total?: number; data?: InformePendiente[] }>(
    "/informes-diarios/pendientes"
  );
  const data = Array.isArray(response.data.data) ? response.data.data : [];
  return {
    total: response.data.total ?? data.length,
    data,
  };
};

export const getTrabajadoresInforme = async (): Promise<InformeUsuario[]> => {
  const response = await api.get<{ data?: InformeUsuario[] } | InformeUsuario[]>(
    "/informes-diarios/trabajadores"
  );
  const payload = response.data;
  if (Array.isArray(payload)) {
    return payload;
  }
  return Array.isArray(payload.data) ? payload.data : [];
};

export const createInformeDiario = async (data: InformeDiarioCreateRequest) => {
  const response = await api.post<{ message: string; data: InformeDiario }>(
    "/informes-diarios",
    data
  );
  return response.data;
};

export const updateInformeDiario = async (id: number, data: InformeDiarioUpdateRequest) => {
  const response = await api.put<{ message: string; data: InformeDiario }>(
    `/informes-diarios/${id}`,
    data
  );
  return response.data;
};

export const revisarInformeDiario = async (id: number) => {
  const response = await api.patch<{ message: string; data: InformeDiario }>(
    `/informes-diarios/${id}/revisar`
  );
  return response.data;
};
