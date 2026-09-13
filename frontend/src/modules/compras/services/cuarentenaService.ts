import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import { Cuarentena, CuarentenaCreateRequest, CuarentenaListParams } from "../types";

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

export const getCuarentenas = async (
  params: CuarentenaListParams = {}
): Promise<PaginatedResponse<Cuarentena>> => {
  const response = await api.get<LaravelPaginatedResponse<Cuarentena>>("/compras/cuarentenas", {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      cod_compra: params.cod_compra || undefined,
      proveedor_id: params.proveedor_id,
      estado: params.estado || undefined,
      origen: params.origen || undefined,
      fecha: params.fecha || undefined,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });

  return mapPaginated(response.data);
};

export const getCuarentena = async (id: number): Promise<Cuarentena> => {
  const response = await api.get<{ data: Cuarentena }>(`/compras/cuarentenas/${id}`);
  return response.data.data;
};

export const createCuarentena = async (data: CuarentenaCreateRequest) => {
  const response = await api.post<{ message: string; data: Cuarentena }>(
    "/compras/cuarentenas",
    data
  );
  return response.data;
};

export const updateCuarentena = async (id: number, data: CuarentenaCreateRequest) => {
  const response = await api.put<{ message: string; data: Cuarentena }>(
    `/compras/cuarentenas/${id}`,
    data
  );
  return response.data;
};

export const generarCuarentenaDesdeOrden = async (ordenId: number) => {
  const response = await api.post<{ message: string; data: Cuarentena }>(
    `/compras/ordenes-compra/${ordenId}/cuarentena`
  );
  return response.data;
};

export const completarCuarentena = async (id: number) => {
  const response = await api.post<{ message: string; data: Cuarentena }>(
    `/compras/cuarentenas/${id}/completar`
  );
  return response.data;
};

export const downloadCuarentenaPdf = async (id: number, codigo: string) => {
  const response = await api.get(`/compras/cuarentenas/${id}/pdf`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `CQ-${codigo}.pdf`;
  link.click();
  window.URL.revokeObjectURL(url);
};
