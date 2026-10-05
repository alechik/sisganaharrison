import api from "@/api/axios";
import { Reporte, ReporteFiltros } from "../types";

const paramsDe = (filtros: ReporteFiltros, incluirPagina: boolean) => {
  const params: Record<string, string | number> = {};
  if (filtros.tipo !== "inventario") {
    params.desde = filtros.desde;
    params.hasta = filtros.hasta;
  }
  if (filtros.tipo === "inventario") {
    if (filtros.sexo !== "all") params.sexo = filtros.sexo;
    if (filtros.raza_id !== "all") params.raza_id = filtros.raza_id;
    if (filtros.categoria_id !== "all") params.categoria_id = filtros.categoria_id;
    if (filtros.estado_productivo_id !== "all") params.estado_productivo_id = filtros.estado_productivo_id;
    if (filtros.lote_id !== "all") params.lote_id = filtros.lote_id;
    if (filtros.estado !== "all") params.estado = filtros.estado;
  }
  if (filtros.tipo === "sanidad") {
    if (filtros.tipo_evento_id !== "all") params.tipo_evento_id = filtros.tipo_evento_id;
    if (filtros.animal_id !== "all") params.animal_id = filtros.animal_id;
  }
  if (incluirPagina) params.page = filtros.page;
  return params;
};

export const getReporte = async (filtros: ReporteFiltros): Promise<Reporte> => {
  const response = await api.get<{ data: Reporte }>(`/reportes/${filtros.tipo}`, {
    params: paramsDe(filtros, true),
  });
  return response.data.data;
};

export const downloadReportePdf = async (filtros: ReporteFiltros) => {
  const response = await api.get(`/reportes/${filtros.tipo}/pdf`, {
    params: paramsDe(filtros, false),
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `reporte-${filtros.tipo}.pdf`;
  link.click();
  window.URL.revokeObjectURL(url);
};
