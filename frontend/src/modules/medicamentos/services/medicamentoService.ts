import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  Medicamento,
  MedicamentoCreateRequest,
  MedicamentoListParams,
  MedicamentoUpdateRequest,
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

export const getMedicamentos = async (
  params: MedicamentoListParams = {}
): Promise<PaginatedResponse<Medicamento>> => {
  const response = await api.get<LaravelPaginatedResponse<Medicamento>>("/medicamentos", {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
        search: params.search || undefined,
        activo: params.activo,
        presentacion_id: params.presentacion_id || undefined,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });

  return mapPaginated(response.data);
};

export const getDeletedMedicamentos = async (
  params: Pick<MedicamentoListParams, "page" | "per_page" | "sort_by" | "sort_dir"> = {}
): Promise<PaginatedResponse<Medicamento>> => {
  const response = await api.get<LaravelPaginatedResponse<Medicamento>>(
    "/medicamentos/eliminados",
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

export const getMedicamento = async (id: number): Promise<Medicamento> => {
  const response = await api.get<{ data: Medicamento }>(`/medicamentos/${id}`);
  return response.data.data;
};

export const createMedicamento = async (data: MedicamentoCreateRequest) => {
  const response = await api.post<{ message: string; data: Medicamento }>("/medicamentos", data);
  return response.data;
};

export const updateMedicamento = async (id: number, data: MedicamentoUpdateRequest) => {
  const response = await api.put<{ message: string; data: Medicamento }>(
    `/medicamentos/${id}`,
    data
  );
  return response.data;
};

export const deleteMedicamento = async (id: number) => {
  const response = await api.delete<{ message: string }>(`/medicamentos/${id}`);
  return response.data;
};

export const changeMedicamentoStatus = async (id: number) => {
  const response = await api.patch<{ message: string; data: Medicamento }>(
    `/medicamentos/${id}/estado`
  );
  return response.data;
};

export const restoreMedicamento = async (id: number) => {
  const response = await api.post<{ message: string; data: Medicamento }>(
    `/medicamentos/${id}/restaurar`
  );
  return response.data;
};
