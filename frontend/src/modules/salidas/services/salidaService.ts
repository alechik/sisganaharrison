import api from "@/api/axios";
import { AnimalDisponibleVenta } from "@/modules/ventas/types";
import { PaginatedResponse } from "@/types/api";
import {
  Salida,
  SalidaCreateRequest,
  SalidaListParams,
  VentaDisponibleSalida,
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

export const getSalidas = async (
  params: SalidaListParams = {}
): Promise<PaginatedResponse<Salida>> => {
  const response = await api.get<LaravelPaginatedResponse<Salida>>("/salidas", {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      codigo: params.codigo || undefined,
      cliente: params.cliente || undefined,
      tipo_salida_id: params.tipo_salida_id || undefined,
      estado: params.estado || undefined,
      fecha_desde: params.fecha_desde || undefined,
      fecha_hasta: params.fecha_hasta || undefined,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });

  return mapPaginated(response.data);
};

export const getSalida = async (id: number): Promise<Salida> => {
  const response = await api.get<{ data: Salida }>(`/salidas/${id}`);
  return response.data.data;
};

export const getVentasDisponiblesSalida = async (): Promise<VentaDisponibleSalida[]> => {
  const response = await api.get<{ data: VentaDisponibleSalida[] }>(
    "/salidas/ventas-disponibles"
  );
  return response.data.data;
};

export const buscarAnimalesSalida = async (
  search: string
): Promise<AnimalDisponibleVenta[]> => {
  const response = await api.get<{ data: AnimalDisponibleVenta[] }>(
    "/salidas/animales-disponibles",
    { params: { search } }
  );
  return response.data.data;
};

export const createSalida = async (data: SalidaCreateRequest) => {
  const response = await api.post<{ message: string; data: Salida }>("/salidas", data);
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

export const downloadSalidaPdf = async (id: number, codigo: string) => {
  const response = await api.get(`/salidas/${id}/pdf`, { responseType: "blob" });
  openPdfBlob(response.data, codigo, true);
};

export const viewSalidaPdf = async (id: number, codigo: string) => {
  const response = await api.get(`/salidas/${id}/pdf`, {
    responseType: "blob",
    params: { inline: 1 },
  });
  openPdfBlob(response.data, codigo, false);
};
