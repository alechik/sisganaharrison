import api from "@/api/axios";
import { AnimalDisponibleVenta } from "@/modules/ventas/types";
import { PaginatedResponse } from "@/types/api";
import { Traspaso, TraspasoCreateRequest, TraspasoListParams, TraspasoUpdateRequest } from "../types";

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

export const getTraspasos = async (
  params: TraspasoListParams = {}
): Promise<PaginatedResponse<Traspaso>> => {
  const response = await api.get<LaravelPaginatedResponse<Traspaso>>("/traspasos", {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      search: params.search || undefined,
      lote_salida_id: params.lote_salida_id || undefined,
      lote_ingreso_id: params.lote_ingreso_id || undefined,
      fecha_desde: params.fecha_desde || undefined,
      fecha_hasta: params.fecha_hasta || undefined,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });

  return mapPaginated(response.data);
};

export const getTraspaso = async (id: number): Promise<Traspaso> => {
  const response = await api.get<{ data: Traspaso }>(`/traspasos/${id}`);
  return response.data.data;
};

export const getAnimalesTraspaso = async (
  loteId: number,
  traspasoId?: number
): Promise<AnimalDisponibleVenta[]> => {
  const response = await api.get<{ data: AnimalDisponibleVenta[] }>(
    "/traspasos/animales-disponibles",
    { params: { lote_id: loteId, traspaso_id: traspasoId || undefined } }
  );
  return response.data.data;
};

export const createTraspaso = async (data: TraspasoCreateRequest) => {
  const response = await api.post<{ message: string; data: Traspaso }>("/traspasos", data);
  return response.data;
};

export const updateTraspaso = async (id: number, data: TraspasoUpdateRequest) => {
  const response = await api.put<{ message: string; data: Traspaso }>(`/traspasos/${id}`, data);
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

export const downloadTraspasoPdf = async (id: number) => {
  const response = await api.get(`/traspasos/${id}/pdf`, { responseType: "blob" });
  openPdfBlob(response.data, `TRASPASO-${id}`, true);
};

export const viewTraspasoPdf = async (id: number) => {
  const response = await api.get(`/traspasos/${id}/pdf`, {
    responseType: "blob",
    params: { inline: 1 },
  });
  openPdfBlob(response.data, `TRASPASO-${id}`, false);
};
