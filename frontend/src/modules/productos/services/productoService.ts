import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  Producto,
  ProductoCreateRequest,
  ProductoListParams,
  ProductoUpdateRequest,
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

export const getProductos = async (
  params: ProductoListParams = {},
  signal?: AbortSignal
): Promise<PaginatedResponse<Producto>> => {
  const response = await api.get<LaravelPaginatedResponse<Producto>>("/productos", {
    signal,
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
        search: params.search || undefined,
        activo: params.activo,
        presentacion_id: params.presentacion_id || undefined,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });

  return mapPaginated(response.data);
};

export const getDeletedProductos = async (
  params: Pick<ProductoListParams, "page" | "per_page" | "sort_by" | "sort_dir"> = {},
  signal?: AbortSignal
): Promise<PaginatedResponse<Producto>> => {
  const response = await api.get<LaravelPaginatedResponse<Producto>>(
    "/productos/eliminados",
    {
      signal,
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

export const getProducto = async (id: number): Promise<Producto> => {
  const response = await api.get<{ data: Producto }>(`/productos/${id}`);
  return response.data.data;
};

export const createProducto = async (data: ProductoCreateRequest) => {
  const response = await api.post<{ message: string; data: Producto }>("/productos", data);
  return response.data;
};

export const updateProducto = async (id: number, data: ProductoUpdateRequest) => {
  const response = await api.put<{ message: string; data: Producto }>(
    `/productos/${id}`,
    data
  );
  return response.data;
};

export const deleteProducto = async (id: number) => {
  const response = await api.delete<{ message: string }>(`/productos/${id}`);
  return response.data;
};

export const changeProductoStatus = async (id: number) => {
  const response = await api.patch<{ message: string; data: Producto }>(
    `/productos/${id}/estado`
  );
  return response.data;
};

export const restoreProducto = async (id: number) => {
  const response = await api.post<{ message: string; data: Producto }>(
    `/productos/${id}/restaurar`
  );
  return response.data;
};
