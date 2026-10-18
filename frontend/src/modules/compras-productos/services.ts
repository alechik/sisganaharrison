import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  IngresoProducto,
  OrdenCompraProducto,
  OrdenCompraProductoCreateRequest,
  OrdenCompraProductoListParams,
} from "./types";

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

const downloadPdf = async (url: string, filename: string) => {
  const response = await api.get(url, { responseType: "blob" });
  const href = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(href);
};

export const getOrdenesProductos = async (
  params: OrdenCompraProductoListParams = {},
  signal?: AbortSignal
): Promise<PaginatedResponse<OrdenCompraProducto>> => {
  const response = await api.get<LaravelPaginatedResponse<OrdenCompraProducto>>(
    "/compras-productos/ordenes",
    {
      signal,
      params: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 10,
        search: params.search || undefined,
        cod_compra: params.cod_compra || undefined,
        proveedor_id: params.proveedor_id,
        user_id: params.user_id,
        estado: params.estado || undefined,
        fecha: params.fecha || undefined,
        sort_by: params.sort_by,
        sort_dir: params.sort_dir,
      },
    }
  );
  return mapPaginated(response.data);
};

export const getOrdenProducto = async (id: number) =>
  (await api.get<{ data: OrdenCompraProducto }>(`/compras-productos/ordenes/${id}`)).data.data;

export const createOrdenProducto = async (data: OrdenCompraProductoCreateRequest) =>
  (await api.post<{ message: string; data: OrdenCompraProducto }>("/compras-productos/ordenes", data)).data;

export const updateOrdenProducto = async (id: number, data: OrdenCompraProductoCreateRequest) =>
  (await api.put<{ message: string; data: OrdenCompraProducto }>(`/compras-productos/ordenes/${id}`, data)).data;

export const autorizarOrdenProducto = async (id: number, observacion?: string) =>
  (await api.post<{ message: string; data: OrdenCompraProducto }>(`/compras-productos/ordenes/${id}/autorizar`, { observacion })).data;

export const cancelarOrdenProducto = async (id: number, observacion?: string) =>
  (await api.post<{ message: string; data: OrdenCompraProducto }>(`/compras-productos/ordenes/${id}/cancelar`, { observacion })).data;

export const downloadOrdenProductoPdf = (id: number, codigo: string) =>
  downloadPdf(`/compras-productos/ordenes/${id}/pdf`, `${codigo}.pdf`);

export const traerOrdenProducto = async (ordenId: number) =>
  (await api.get<{ data: OrdenCompraProducto }>("/compras-productos/ingresos/traer", { params: { orden_compra_id: ordenId } })).data.data;

export const getIngresosProductos = async (params: Record<string, unknown> = {}) =>
  (await api.get<{ data: IngresoProducto[] }>("/compras-productos/ingresos", { params })).data;

export const getIngresoProducto = async (id: number) =>
  (await api.get<{ data: IngresoProducto }>(`/compras-productos/ingresos/${id}`)).data.data;

export const createIngresoProducto = async (data: unknown) =>
  (await api.post<{ message: string; data: IngresoProducto }>("/compras-productos/ingresos", data)).data;

export const downloadIngresoProductoPdf = (id: number, codigo: string) =>
  downloadPdf(`/compras-productos/ingresos/${id}/pdf`, `${codigo}.pdf`);
