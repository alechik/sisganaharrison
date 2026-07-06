import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  TipoMovimiento,
  TipoMovimientoCreateRequest,
  TipoMovimientoListParams,
  TipoMovimientoUpdateRequest,
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

export const getTiposMovimientos = async (
  params: TipoMovimientoListParams = {}
): Promise<PaginatedResponse<TipoMovimiento>> => {
  const response = await api.get<LaravelPaginatedResponse<TipoMovimiento>>(
    "/tipos-movimientos",
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

export const getDeletedTiposMovimientos = async (
  params: Pick<TipoMovimientoListParams, "page" | "per_page" | "sort_by" | "sort_dir"> = {}
): Promise<PaginatedResponse<TipoMovimiento>> => {
  const response = await api.get<LaravelPaginatedResponse<TipoMovimiento>>(
    "/tipos-movimientos/eliminados",
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

export const getTipoMovimiento = async (id: number): Promise<TipoMovimiento> => {
  const response = await api.get<{ data: TipoMovimiento }>(
    `/tipos-movimientos/${id}`
  );
  return response.data.data;
};

export const createTipoMovimiento = async (data: TipoMovimientoCreateRequest) => {
  const response = await api.post<{ message: string; data: TipoMovimiento }>(
    "/tipos-movimientos",
    data
  );
  return response.data;
};

export const updateTipoMovimiento = async (
  id: number,
  data: TipoMovimientoUpdateRequest
) => {
  const response = await api.put<{ message: string; data: TipoMovimiento }>(
    `/tipos-movimientos/${id}`,
    data
  );
  return response.data;
};

export const deleteTipoMovimiento = async (id: number) => {
  const response = await api.delete<{ message: string }>(`/tipos-movimientos/${id}`);
  return response.data;
};

export const changeTipoMovimientoStatus = async (id: number) => {
  const response = await api.patch<{ message: string; data: TipoMovimiento }>(
    `/tipos-movimientos/${id}/estado`
  );
  return response.data;
};

export const restoreTipoMovimiento = async (id: number) => {
  const response = await api.post<{ message: string; data: TipoMovimiento }>(
    `/tipos-movimientos/${id}/restaurar`
  );
  return response.data;
};
