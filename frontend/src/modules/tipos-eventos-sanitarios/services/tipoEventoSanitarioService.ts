import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  TipoEventoSanitario,
  TipoEventoSanitarioCreateRequest,
  TipoEventoSanitarioListParams,
  TipoEventoSanitarioUpdateRequest,
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

export const getTiposEventosSanitarios = async (
  params: TipoEventoSanitarioListParams = {}
): Promise<PaginatedResponse<TipoEventoSanitario>> => {
  const response = await api.get<LaravelPaginatedResponse<TipoEventoSanitario>>(
    "/tipos-eventos-sanitarios",
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

export const getDeletedTiposEventosSanitarios = async (
  params: Pick<TipoEventoSanitarioListParams, "page" | "per_page" | "sort_by" | "sort_dir"> = {}
): Promise<PaginatedResponse<TipoEventoSanitario>> => {
  const response = await api.get<LaravelPaginatedResponse<TipoEventoSanitario>>(
    "/tipos-eventos-sanitarios/eliminados",
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

export const getTipoEventoSanitario = async (id: number): Promise<TipoEventoSanitario> => {
  const response = await api.get<{ data: TipoEventoSanitario }>(
    `/tipos-eventos-sanitarios/${id}`
  );
  return response.data.data;
};

export const createTipoEventoSanitario = async (data: TipoEventoSanitarioCreateRequest) => {
  const response = await api.post<{ message: string; data: TipoEventoSanitario }>(
    "/tipos-eventos-sanitarios",
    data
  );
  return response.data;
};

export const updateTipoEventoSanitario = async (
  id: number,
  data: TipoEventoSanitarioUpdateRequest
) => {
  const response = await api.put<{ message: string; data: TipoEventoSanitario }>(
    `/tipos-eventos-sanitarios/${id}`,
    data
  );
  return response.data;
};

export const deleteTipoEventoSanitario = async (id: number) => {
  const response = await api.delete<{ message: string }>(`/tipos-eventos-sanitarios/${id}`);
  return response.data;
};

export const changeTipoEventoSanitarioStatus = async (id: number) => {
  const response = await api.patch<{ message: string; data: TipoEventoSanitario }>(
    `/tipos-eventos-sanitarios/${id}/estado`
  );
  return response.data;
};

export const restoreTipoEventoSanitario = async (id: number) => {
  const response = await api.post<{ message: string; data: TipoEventoSanitario }>(
    `/tipos-eventos-sanitarios/${id}/restaurar`
  );
  return response.data;
};
