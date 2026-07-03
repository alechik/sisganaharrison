import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  Vacuna,
  VacunaCreateRequest,
  VacunaListParams,
  VacunaUpdateRequest,
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

export const getVacunas = async (
  params: VacunaListParams = {}
): Promise<PaginatedResponse<Vacuna>> => {
  const response = await api.get<LaravelPaginatedResponse<Vacuna>>("/vacunas", {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      search: params.search || undefined,
      activo: params.activo,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });

  return mapPaginated(response.data);
};

export const getDeletedVacunas = async (
  params: Pick<VacunaListParams, "page" | "per_page" | "sort_by" | "sort_dir"> = {}
): Promise<PaginatedResponse<Vacuna>> => {
  const response = await api.get<LaravelPaginatedResponse<Vacuna>>(
    "/vacunas/eliminados",
    {
      params: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 10,
        sort_by: params.sort_by,
        sort_dir: params.sort_dir,
      },
    }
  );

  return mapPaginated(response.data);
};

export const getVacuna = async (id: number): Promise<Vacuna> => {
  const response = await api.get<{ data: Vacuna }>(`/vacunas/${id}`);
  return response.data.data;
};

export const createVacuna = async (data: VacunaCreateRequest) => {
  const response = await api.post<{ message: string; data: Vacuna }>("/vacunas", data);
  return response.data;
};

export const updateVacuna = async (id: number, data: VacunaUpdateRequest) => {
  const response = await api.put<{ message: string; data: Vacuna }>(
    `/vacunas/${id}`,
    data
  );
  return response.data;
};

export const deleteVacuna = async (id: number) => {
  const response = await api.delete<{ message: string }>(`/vacunas/${id}`);
  return response.data;
};

export const changeVacunaStatus = async (id: number) => {
  const response = await api.patch<{ message: string; data: Vacuna }>(
    `/vacunas/${id}/estado`
  );
  return response.data;
};

export const restoreVacuna = async (id: number) => {
  const response = await api.post<{ message: string; data: Vacuna }>(
    `/vacunas/${id}/restaurar`
  );
  return response.data;
};
