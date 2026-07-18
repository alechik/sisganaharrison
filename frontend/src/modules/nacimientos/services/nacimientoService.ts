import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  Nacimiento,
  NacimientoCreateRequest,
  NacimientoListParams,
  NacimientoUpdateRequest,
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

export const getNacimientos = async (
  params: NacimientoListParams = {}
): Promise<PaginatedResponse<Nacimiento>> => {
  const response = await api.get<LaravelPaginatedResponse<Nacimiento>>("/nacimientos", {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      search: params.search || undefined,
      parto_id: params.parto_id || undefined,
      animal_id: params.animal_id || undefined,
      estado_nacimiento: params.estado_nacimiento || undefined,
      sexo: params.sexo || undefined,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });

  return mapPaginated(response.data);
};

export const getNacimiento = async (id: number): Promise<Nacimiento> => {
  const response = await api.get<{ data: Nacimiento }>(`/nacimientos/${id}`);
  return response.data.data;
};

export const createNacimiento = async (data: NacimientoCreateRequest) => {
  const response = await api.post<{ message: string; data: Nacimiento }>("/nacimientos", data);
  return response.data;
};

export const updateNacimiento = async (id: number, data: NacimientoUpdateRequest) => {
  const response = await api.put<{ message: string; data: Nacimiento }>(
    `/nacimientos/${id}`,
    data
  );
  return response.data;
};
