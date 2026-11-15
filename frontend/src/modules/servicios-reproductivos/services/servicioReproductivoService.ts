import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  AnimalDisponibleRepro,
  ConfirmarGestacionRequest,
  InseminacionExcelPreview,
  InseminacionLoteRequest,
  RegistrarPartoNacimientoRequest,
  SemenOption,
  ServicioReproductivo,
  ServicioReproductivoCreateRequest,
  ServicioReproductivoListParams,
  ServicioReproductivoUpdateRequest,
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

export const getServiciosReproductivos = async (
  params: ServicioReproductivoListParams = {},
  signal?: AbortSignal
): Promise<PaginatedResponse<ServicioReproductivo>> => {
  const response = await api.get<LaravelPaginatedResponse<ServicioReproductivo>>(
    "/servicios-reproductivos",
    {
      signal,
      params: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 10,
        search: params.search || undefined,
        hembra_id: params.hembra_id || undefined,
        macho_id: params.macho_id || undefined,
        tipo_servicio: params.tipo_servicio || undefined,
        resultado: params.resultado || undefined,
        sin_gestacion: params.sin_gestacion ? 1 : undefined,
        incluir_id: params.incluir_id || undefined,
        fecha_desde: params.fecha_desde || undefined,
        fecha_hasta: params.fecha_hasta || undefined,
        sort_by: params.sort_by,
        sort_dir: params.sort_dir,
      },
    }
  );

  return mapPaginated(response.data);
};

export const getServicioReproductivo = async (id: number): Promise<ServicioReproductivo> => {
  const response = await api.get<{ data: ServicioReproductivo }>(
    `/servicios-reproductivos/${id}`
  );
  return response.data.data;
};

export const createServicioReproductivo = async (data: ServicioReproductivoCreateRequest) => {
  const response = await api.post<{ message: string; data: ServicioReproductivo }>(
    "/servicios-reproductivos",
    data
  );
  return response.data;
};

export const createLoteInseminacion = async (data: InseminacionLoteRequest) => {
  const response = await api.post<{ message: string; data: ServicioReproductivo[] }>(
    "/servicios-reproductivos/lote-ia",
    data
  );
  return response.data;
};

export const buscarAnimalesRepro = async (search: string, sexo?: "H" | "M") => {
  const response = await api.get<{ data: AnimalDisponibleRepro[] }>(
    "/servicios-reproductivos/animales-disponibles",
    { params: { search, sexo } }
  );
  return response.data.data;
};

export const buscarSemen = async (search: string) => {
  const response = await api.get<{ data: SemenOption[] }>(
    "/servicios-reproductivos/semen-disponible",
    { params: { search } }
  );
  return response.data.data;
};

export const downloadIaPlantilla = async () => {
  const response = await api.get("/servicios-reproductivos/plantilla-excel", {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(
    new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "plantilla_ia_vacas.xlsx";
  link.click();
  window.URL.revokeObjectURL(url);
};

export const previewIaExcel = async (file: File): Promise<InseminacionExcelPreview> => {
  const formData = new FormData();
  formData.append("archivo", file);
  const response = await api.post<{ data: InseminacionExcelPreview }>(
    "/servicios-reproductivos/vista-previa-excel",
    formData,
    {
      headers: {
        "Content-Type": undefined,
      },
    }
  );
  return response.data.data;
};

export const downloadServicioReproductivoPdf = async (id: number, codigo: string) => {
  const response = await api.get(`/servicios-reproductivos/${id}/pdf`, { responseType: "blob" });
  const href = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = href;
  link.download = `${codigo}.pdf`;
  link.click();
  window.URL.revokeObjectURL(href);
};

export const updateServicioReproductivo = async (
  id: number,
  data: ServicioReproductivoUpdateRequest
) => {
  const response = await api.put<{ message: string; data: ServicioReproductivo }>(
    `/servicios-reproductivos/${id}`,
    data
  );
  return response.data;
};

export const confirmarGestacionServicio = async (
  id: number,
  data: ConfirmarGestacionRequest
) => {
  const response = await api.post<{ message: string; data: ServicioReproductivo }>(
    `/servicios-reproductivos/${id}/confirmar-gestacion`,
    data
  );
  return response.data;
};

export const registrarPartoNacimientoServicio = async (
  id: number,
  data: RegistrarPartoNacimientoRequest
) => {
  const response = await api.post<{ message: string; data: ServicioReproductivo }>(
    `/servicios-reproductivos/${id}/registrar-parto`,
    data
  );
  return response.data;
};
