import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  OrdenCompra,
  OrdenCompraCreateRequest,
  OrdenCompraListParams,
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

export const getOrdenesCompra = async (
  params: OrdenCompraListParams = {}
): Promise<PaginatedResponse<OrdenCompra>> => {
  const response = await api.get<LaravelPaginatedResponse<OrdenCompra>>(
    "/compras/ordenes-compra",
    {
      params: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 10,
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

export const getOrdenesPendientes = async () => {
  const response = await api.get<{ total: number; data: OrdenCompra[] }>(
    "/compras/ordenes-compra/pendientes"
  );
  return response.data;
};

export const getOrdenCompra = async (id: number): Promise<OrdenCompra> => {
  const response = await api.get<{ data: OrdenCompra }>(`/compras/ordenes-compra/${id}`);
  return response.data.data;
};

export const createOrdenCompra = async (data: OrdenCompraCreateRequest) => {
  const response = await api.post<{ message: string; data: OrdenCompra }>(
    "/compras/ordenes-compra",
    data
  );
  return response.data;
};

export const updateOrdenCompra = async (id: number, data: OrdenCompraCreateRequest) => {
  const response = await api.put<{ message: string; data: OrdenCompra }>(
    `/compras/ordenes-compra/${id}`,
    data
  );
  return response.data;
};

export const autorizarOrdenCompra = async (id: number, observacion?: string) => {
  const response = await api.post<{ message: string; data: OrdenCompra }>(
    `/compras/ordenes-compra/${id}/autorizar`,
    { observacion }
  );
  return response.data;
};

export const rechazarOrdenCompra = async (id: number, observacion?: string) => {
  const response = await api.post<{ message: string; data: OrdenCompra }>(
    `/compras/ordenes-compra/${id}/rechazar`,
    { observacion }
  );
  return response.data;
};

export const downloadOrdenCompraPdf = async (id: number, codigo: string) => {
  const response = await api.get(`/compras/ordenes-compra/${id}/pdf`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${codigo}.pdf`;
  link.click();
  window.URL.revokeObjectURL(url);
};
