import api from "@/api/axios";
import { AnimalDisponibleVenta } from "@/modules/ventas/types";
import { PaginatedResponse } from "@/types/api";
import {
  EventoSanitario,
  EventoSanitarioCreateRequest,
  EventoSanitarioListParams,
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

export const getEventosSanitarios = async (
  params: EventoSanitarioListParams = {}
): Promise<PaginatedResponse<EventoSanitario>> => {
  const response = await api.get<LaravelPaginatedResponse<EventoSanitario>>(
    "/eventos-sanitarios",
    {
      params: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 10,
        search: params.search || undefined,
        animal_id: params.animal_id || undefined,
        tipo_evento_id: params.tipo_evento_id || undefined,
        medicamento_id: params.medicamento_id || undefined,
        fecha_desde: params.fecha_desde || undefined,
        fecha_hasta: params.fecha_hasta || undefined,
        sort_by: params.sort_by,
        sort_dir: params.sort_dir,
      },
    }
  );

  return mapPaginated(response.data);
};

export const getEventoSanitario = async (id: number): Promise<EventoSanitario> => {
  const response = await api.get<{ data: EventoSanitario }>(`/eventos-sanitarios/${id}`);
  return response.data.data;
};

export const createEventoSanitario = async (data: EventoSanitarioCreateRequest) => {
  const response = await api.post<{ message: string; data: EventoSanitario }>(
    "/eventos-sanitarios",
    data
  );
  return response.data;
};

export const buscarAnimalesEventoSanitario = async (search: string) => {
  const response = await api.get<{ data: AnimalDisponibleVenta[] }>(
    "/eventos-sanitarios/animales-disponibles",
    { params: { search } }
  );
  return response.data.data;
};
