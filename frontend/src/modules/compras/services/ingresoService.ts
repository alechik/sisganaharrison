import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  Cuarentena,
  Ingreso,
  IngresoCreateRequest,
  IngresoListParams,
  IngresoPendientes,
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

export const getIngresos = async (
  params: IngresoListParams = {}
): Promise<PaginatedResponse<Ingreso>> => {
  const response = await api.get<LaravelPaginatedResponse<Ingreso>>("/compras/ingresos", {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      codigo: params.codigo || undefined,
      proveedor_id: params.proveedor_id,
      cuarentena_id: params.cuarentena_id,
      lote_id: params.lote_id,
      fecha: params.fecha || undefined,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });

  return mapPaginated(response.data);
};

export const getIngreso = async (id: number): Promise<Ingreso> => {
  const response = await api.get<{ data: Ingreso }>(`/compras/ingresos/${id}`);
  return response.data.data;
};

export const getCuarentenasDisponiblesIngreso = async (): Promise<Cuarentena[]> => {
  const response = await api.get<{ data: Cuarentena[] }>(
    "/compras/ingresos/cuarentenas-disponibles"
  );
  return response.data.data;
};

export const getPendientesIngreso = async (cuarentenaId: number): Promise<IngresoPendientes> => {
  const response = await api.get<{ data: IngresoPendientes }>(
    `/compras/cuarentenas/${cuarentenaId}/pendientes-ingreso`
  );
  return response.data.data;
};

export const createIngreso = async (data: IngresoCreateRequest) => {
  const response = await api.post<{ message: string; data: Ingreso }>("/compras/ingresos", data);
  return response.data;
};

export const downloadIngresoPdf = async (id: number, codigo: string) => {
  const response = await api.get(`/compras/ingresos/${id}/pdf`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${codigo}.pdf`;
  link.click();
  window.URL.revokeObjectURL(url);
};
