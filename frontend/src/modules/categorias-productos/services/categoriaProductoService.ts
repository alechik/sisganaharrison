import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import { CategoriaProducto, CategoriaProductoCreateRequest, CategoriaProductoListParams } from "../types";

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

export const getCategoriasProductos = async (params: CategoriaProductoListParams = {}, signal?: AbortSignal) => {
  const response = await api.get<LaravelPaginatedResponse<CategoriaProducto>>("/categorias-productos", {
    signal,
    params: { page: params.page ?? 1, per_page: params.per_page ?? 10, search: params.search || undefined, activo: params.activo, sort_by: params.sort_by, sort_dir: params.sort_dir },
  });
  return mapPaginated(response.data);
};

export const getDeletedCategoriasProductos = async (
  params: Pick<CategoriaProductoListParams, "page" | "per_page" | "sort_by" | "sort_dir"> = {},
  signal?: AbortSignal
) => {
  const response = await api.get<LaravelPaginatedResponse<CategoriaProducto>>("/categorias-productos/eliminados", {
    signal,
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });
  return mapPaginated(response.data);
};

export const getCategoriaProducto = async (id: number) => {
  const response = await api.get<{ data: CategoriaProducto }>(`/categorias-productos/${id}`);
  return response.data.data;
};

export const createCategoriaProducto = async (data: CategoriaProductoCreateRequest) => {
  const response = await api.post<{ message: string; data: CategoriaProducto }>("/categorias-productos", data);
  return response.data;
};

export const updateCategoriaProducto = async (id: number, data: CategoriaProductoCreateRequest) => {
  const response = await api.put<{ message: string; data: CategoriaProducto }>(`/categorias-productos/${id}`, data);
  return response.data;
};

export const deleteCategoriaProducto = async (id: number) => {
  const response = await api.delete<{ message: string }>(`/categorias-productos/${id}`);
  return response.data;
};

export const restoreCategoriaProducto = async (id: number) => {
  const response = await api.post<{ message: string; data: CategoriaProducto }>(`/categorias-productos/${id}/restaurar`);
  return response.data;
};

export const toggleCategoriaProductoStatus = async (id: number) => {
  const response = await api.patch<{ message: string; data: CategoriaProducto }>(`/categorias-productos/${id}/estado`);
  return response.data;
};
