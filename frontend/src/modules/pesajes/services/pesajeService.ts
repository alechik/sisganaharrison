import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  AnimalDisponiblePesaje,
  Pesaje,
  PesajeCreateRequest,
  PesajeExcelPreview,
  PesajeListParams,
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

export const getPesajes = async (
  params: PesajeListParams = {},
  signal?: AbortSignal
): Promise<PaginatedResponse<Pesaje>> => {
  const response = await api.get<LaravelPaginatedResponse<Pesaje>>("/pesajes", {
    signal,
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      search: params.search || undefined,
      animal_id: params.animal_id || undefined,
      fecha_desde: params.fecha_desde || undefined,
      fecha_hasta: params.fecha_hasta || undefined,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });

  return mapPaginated(response.data);
};

export const getPesaje = async (id: number): Promise<Pesaje> => {
  const response = await api.get<{ data: Pesaje }>(`/pesajes/${id}`);
  return response.data.data;
};

export const createPesaje = async (data: PesajeCreateRequest) => {
  const response = await api.post<{ message: string; data: Pesaje }>("/pesajes", data);
  return response.data;
};

export const buscarAnimalesPesaje = async (search: string) => {
  const response = await api.get<{ data: AnimalDisponiblePesaje[] }>(
    "/pesajes/animales-disponibles",
    { params: { search } }
  );
  return response.data.data;
};

export const downloadPesajePlantilla = async () => {
  const response = await api.get("/pesajes/plantilla-excel", {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(
    new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "plantilla_pesaje_animales.xlsx";
  link.click();
  window.URL.revokeObjectURL(url);
};

export const previewPesajeExcel = async (file: File): Promise<PesajeExcelPreview> => {
  const formData = new FormData();
  formData.append("archivo", file);
  const response = await api.post<{ data: PesajeExcelPreview }>(
    "/pesajes/vista-previa-excel",
    formData,
    {
      headers: {
        "Content-Type": undefined,
      },
    }
  );
  return response.data.data;
};
