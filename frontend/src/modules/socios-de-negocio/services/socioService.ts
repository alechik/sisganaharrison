import api from "@/api/axios";
import { PaginatedResponse } from "@/types/api";
import {
  Socio,
  SocioCreateRequest,
  SocioListParams,
  SocioUpdateRequest,
  TipoPersona,
  TipoPersonaCreateRequest,
  TipoPersonaListParams,
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

export const getSocios = async (
  params: SocioListParams = {}
): Promise<PaginatedResponse<Socio>> => {
  const response = await api.get<LaravelPaginatedResponse<Socio>>("/socios", {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      search: params.search || undefined,
      documento: params.documento || undefined,
      estado: params.estado,
      tipo: params.tipo || undefined,
      tipo_id: params.tipo_id,
      tiene_tipo: params.tiene_tipo,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });

  return mapPaginated(response.data);
};

export const getDeletedSocios = async (
  params: Pick<SocioListParams, "page" | "per_page" | "sort_by" | "sort_dir"> = {}
): Promise<PaginatedResponse<Socio>> => {
  const response = await api.get<LaravelPaginatedResponse<Socio>>("/socios/eliminados", {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });

  return mapPaginated(response.data);
};

export const getSocio = async (id: number): Promise<Socio> => {
  const response = await api.get<{ data: Socio }>(`/socios/${id}`);
  return response.data.data;
};

export const createSocio = async (data: SocioCreateRequest) => {
  const response = await api.post<{ message: string; data: Socio }>("/socios", data);
  return response.data;
};

export const updateSocio = async (id: number, data: SocioUpdateRequest) => {
  const response = await api.put<{ message: string; data: Socio }>(`/socios/${id}`, data);
  return response.data;
};

export const deleteSocio = async (id: number) => {
  const response = await api.delete<{ message: string }>(`/socios/${id}`);
  return response.data;
};

export const changeSocioStatus = async (id: number) => {
  const response = await api.patch<{ message: string; data: Socio }>(`/socios/${id}/estado`);
  return response.data;
};

export const restoreSocio = async (id: number) => {
  const response = await api.post<{ message: string; data: Socio }>(`/socios/${id}/restaurar`);
  return response.data;
};

export const getTiposPersona = async (
  params: TipoPersonaListParams = {}
): Promise<PaginatedResponse<TipoPersona>> => {
  const response = await api.get<LaravelPaginatedResponse<TipoPersona>>("/tipos-persona", {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      search: params.search || undefined,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    },
  });

  return mapPaginated(response.data);
};

export const getTiposPersonaOptions = async (): Promise<TipoPersona[]> => {
  const response = await api.get<{ data: TipoPersona[] }>("/tipos-persona", {
    params: { all: true },
  });
  return response.data.data;
};

export const getTipoPersona = async (id: number): Promise<TipoPersona> => {
  const response = await api.get<{ data: TipoPersona }>(`/tipos-persona/${id}`);
  return response.data.data;
};

export const createTipoPersona = async (data: TipoPersonaCreateRequest) => {
  const response = await api.post<{ message: string; data: TipoPersona }>("/tipos-persona", data);
  return response.data;
};

export const updateTipoPersona = async (id: number, data: TipoPersonaCreateRequest) => {
  const response = await api.put<{ message: string; data: TipoPersona }>(`/tipos-persona/${id}`, data);
  return response.data;
};

export const deleteTipoPersona = async (id: number) => {
  const response = await api.delete<{ message: string }>(`/tipos-persona/${id}`);
  return response.data;
};
