import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import { IngresoProducto, OrdenCompraProducto } from "./types";

const downloadPdf = async (url: string, filename: string) => {
  const response = await api.get(url, { responseType: "blob" });
  const href = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(href);
};

export const getOrdenesProductos = async (params: Record<string, unknown> = {}) =>
  (await api.get<{ data: OrdenCompraProducto[]; meta: PaginatedResponse<OrdenCompraProducto>["meta"] }>("/compras-productos/ordenes", { params })).data;

export const getOrdenProducto = async (id: number) =>
  (await api.get<{ data: OrdenCompraProducto }>(`/compras-productos/ordenes/${id}`)).data.data;

export const createOrdenProducto = async (data: unknown) =>
  (await api.post<{ message: string; data: OrdenCompraProducto }>("/compras-productos/ordenes", data)).data;

export const autorizarOrdenProducto = async (id: number, observacion?: string) =>
  (await api.post<{ data: OrdenCompraProducto }>(`/compras-productos/ordenes/${id}/autorizar`, { observacion })).data;

export const cancelarOrdenProducto = async (id: number, observacion?: string) =>
  (await api.post<{ data: OrdenCompraProducto }>(`/compras-productos/ordenes/${id}/cancelar`, { observacion })).data;

export const downloadOrdenProductoPdf = (id: number, codigo: string) => downloadPdf(`/compras-productos/ordenes/${id}/pdf`, `${codigo}.pdf`);

export const traerOrdenProducto = async (ordenId: number) =>
  (await api.get<{ data: OrdenCompraProducto }>("/compras-productos/ingresos/traer", { params: { orden_compra_id: ordenId } })).data.data;

export const getIngresosProductos = async (params: Record<string, unknown> = {}) =>
  (await api.get<{ data: IngresoProducto[] }>("/compras-productos/ingresos", { params })).data;

export const getIngresoProducto = async (id: number) =>
  (await api.get<{ data: IngresoProducto }>(`/compras-productos/ingresos/${id}`)).data.data;

export const createIngresoProducto = async (data: unknown) =>
  (await api.post<{ message: string; data: IngresoProducto }>("/compras-productos/ingresos", data)).data;

export const downloadIngresoProductoPdf = (id: number, codigo: string) => downloadPdf(`/compras-productos/ingresos/${id}/pdf`, `${codigo}.pdf`);
