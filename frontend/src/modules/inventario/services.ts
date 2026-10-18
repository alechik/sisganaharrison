import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import { MovimientoItem, StockItem } from "./types";

export const getInventarioStock = async (params: Record<string, unknown> = {}) => {
  const response = await api.get<{ data: StockItem[]; meta: PaginatedResponse<StockItem>["meta"]; links: PaginatedResponse<StockItem>["links"] }>("/inventario/stock", { params });
  return response.data;
};

export const getInventarioMovimientos = async (params: Record<string, unknown> = {}) => {
  const response = await api.get<{ data: MovimientoItem[]; meta: PaginatedResponse<MovimientoItem>["meta"]; links: PaginatedResponse<MovimientoItem>["links"] }>("/inventario/movimientos", { params });
  return response.data;
};
