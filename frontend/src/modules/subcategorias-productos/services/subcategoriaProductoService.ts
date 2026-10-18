import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import { SubcategoriaProducto, SubcategoriaProductoCreateRequest, SubcategoriaProductoListParams } from "../types";

interface LaravelPaginatedResponse<T> { data: T[]; meta: PaginatedResponse<T>["meta"]; links: PaginatedResponse<T>["links"]; }
const mapPaginated = <T>(response: LaravelPaginatedResponse<T>): PaginatedResponse<T> => ({ data: response.data, meta: response.meta, links: response.links });

export const getSubcategoriasProductos = async (params: SubcategoriaProductoListParams = {}, signal?: AbortSignal) => {
  const response = await api.get<LaravelPaginatedResponse<SubcategoriaProducto>>("/subcategorias-productos", {
    signal,
    params: { page: params.page ?? 1, per_page: params.per_page ?? 100, search: params.search || undefined, categoria_producto_id: params.categoria_producto_id, activo: params.activo, sort_by: params.sort_by, sort_dir: params.sort_dir },
  });
  return mapPaginated(response.data);
};
export const getDeletedSubcategoriasProductos = async (
  params: Pick<SubcategoriaProductoListParams, "page" | "per_page" | "sort_by" | "sort_dir"> = {},
  signal?: AbortSignal
) => {
  const response = await api.get<LaravelPaginatedResponse<SubcategoriaProducto>>("/subcategorias-productos/eliminados", {
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
export const getSubcategoriaProducto = async (id: number) => (await api.get<{ data: SubcategoriaProducto }>(`/subcategorias-productos/${id}`)).data.data;
export const createSubcategoriaProducto = async (data: SubcategoriaProductoCreateRequest) => (await api.post<{ message: string; data: SubcategoriaProducto }>("/subcategorias-productos", data)).data;
export const updateSubcategoriaProducto = async (id: number, data: SubcategoriaProductoCreateRequest) => (await api.put<{ message: string; data: SubcategoriaProducto }>(`/subcategorias-productos/${id}`, data)).data;
export const deleteSubcategoriaProducto = async (id: number) => (await api.delete<{ message: string }>(`/subcategorias-productos/${id}`)).data;
export const restoreSubcategoriaProducto = async (id: number) => (await api.post<{ message: string; data: SubcategoriaProducto }>(`/subcategorias-productos/${id}/restaurar`)).data;
export const toggleSubcategoriaProductoStatus = async (id: number) => (await api.patch<{ message: string; data: SubcategoriaProducto }>(`/subcategorias-productos/${id}/estado`)).data;
