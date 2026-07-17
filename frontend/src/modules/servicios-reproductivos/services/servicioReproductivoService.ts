import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
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
  params: ServicioReproductivoListParams = {}
): Promise<PaginatedResponse<ServicioReproductivo>> => {
  const response = await api.get<LaravelPaginatedResponse<ServicioReproductivo>>(
    "/servicios-reproductivos",
    {
      params: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 10,
        search: params.search || undefined,
        hembra_id: params.hembra_id || undefined,
        macho_id: params.macho_id || undefined,
        tipo_servicio: params.tipo_servicio || undefined,
        resultado: params.resultado || undefined,
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
