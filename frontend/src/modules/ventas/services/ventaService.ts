import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  AnimalDisponibleVenta,
  Venta,
  VentaCreateRequest,
  VentaListParams,
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

export const getVentas = async (
  params: VentaListParams = {}
): Promise<PaginatedResponse<Venta>> => {
  const response = await api.get<LaravelPaginatedResponse<Venta>>("/ventas", {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      cod_venta: params.cod_venta || undefined,
      cliente: params.cliente || undefined,
      estado: params.estado || undefined,
      fecha_desde: params.fecha_desde || undefined,
      fecha_hasta: params.fecha_hasta || undefined,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });

  return mapPaginated(response.data);
};

export const getVenta = async (id: number): Promise<Venta> => {
  const response = await api.get<{ data: Venta }>(`/ventas/${id}`);
  return response.data.data;
};

export const getAnimalesDisponiblesVenta = async (params: {
  potrero_id?: number;
  lote_id?: number;
  categoria_id?: number;
  venta_id?: number;
}): Promise<AnimalDisponibleVenta[]> => {
  const response = await api.get<{ data: AnimalDisponibleVenta[] }>(
    "/ventas/animales-disponibles",
    { params }
  );
  return response.data.data;
};

export const createVenta = async (data: VentaCreateRequest) => {
  const response = await api.post<{ message: string; data: Venta }>("/ventas", data);
  return response.data;
};

export const updateVenta = async (id: number, data: VentaCreateRequest) => {
  const response = await api.put<{ message: string; data: Venta }>(`/ventas/${id}`, data);
  return response.data;
};

export const autorizarVenta = async (id: number, observacion?: string) => {
  const response = await api.post<{ message: string; data: Venta }>(`/ventas/${id}/autorizar`, {
    observacion,
  });
  return response.data;
};

export const anularVenta = async (id: number, observacion?: string) => {
  const response = await api.post<{ message: string; data: Venta }>(`/ventas/${id}/anular`, {
    observacion,
  });
  return response.data;
};

const openPdfBlob = (data: Blob, codigo: string, download: boolean) => {
  const url = window.URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
  if (download) {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${codigo}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  } else {
    window.open(url, "_blank");
  }
};

export const downloadVentaPdf = async (id: number, codigo: string) => {
  const response = await api.get(`/ventas/${id}/pdf`, { responseType: "blob" });
  openPdfBlob(response.data, codigo, true);
};

export const viewVentaPdf = async (id: number, codigo: string) => {
  const response = await api.get(`/ventas/${id}/pdf`, {
    responseType: "blob",
    params: { inline: 1 },
  });
  openPdfBlob(response.data, codigo, false);
};
