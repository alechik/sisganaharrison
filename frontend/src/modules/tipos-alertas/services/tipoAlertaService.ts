import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  TipoAlerta,
  TipoAlertaCreateRequest,
  TipoAlertaListParams,
  TipoAlertaUpdateRequest,
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

export const getTiposAlertas = async (
  params: TipoAlertaListParams = {}
): Promise<PaginatedResponse<TipoAlerta>> => {
  const response = await api.get<LaravelPaginatedResponse<TipoAlerta>>(
    "/tipos-alertas",
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

export const getDeletedTiposAlertas = async (
  params: Pick<TipoAlertaListParams, "page" | "per_page" | "sort_by" | "sort_dir"> = {}
): Promise<PaginatedResponse<TipoAlerta>> => {
  const response = await api.get<LaravelPaginatedResponse<TipoAlerta>>(
    "/tipos-alertas/eliminados",
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

export const getTipoAlerta = async (id: number): Promise<TipoAlerta> => {
  const response = await api.get<{ data: TipoAlerta }>(
    `/tipos-alertas/${id}`
  );
  return response.data.data;
};

export const createTipoAlerta = async (data: TipoAlertaCreateRequest) => {
  const response = await api.post<{ message: string; data: TipoAlerta }>(
    "/tipos-alertas",
    data
  );
  return response.data;
};

export const updateTipoAlerta = async (
  id: number,
  data: TipoAlertaUpdateRequest
) => {
  const response = await api.put<{ message: string; data: TipoAlerta }>(
    `/tipos-alertas/${id}`,
    data
  );
  return response.data;
};

export const deleteTipoAlerta = async (id: number) => {
  const response = await api.delete<{ message: string }>(`/tipos-alertas/${id}`);
  return response.data;
};

export const changeTipoAlertaStatus = async (id: number) => {
  const response = await api.patch<{ message: string; data: TipoAlerta }>(
    `/tipos-alertas/${id}/estado`
  );
  return response.data;
};

export const restoreTipoAlerta = async (id: number) => {
  const response = await api.post<{ message: string; data: TipoAlerta }>(
    `/tipos-alertas/${id}/restaurar`
  );
  return response.data;
};
