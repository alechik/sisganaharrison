import api from "@/api/axios";
import { DashboardData } from "../types";

export interface DashboardConsulta {
  periodo: "mes" | "trimestre" | "anio" | "rango";
  desde?: string;
  hasta?: string;
}

export const getDashboard = async (consulta: DashboardConsulta): Promise<DashboardData> => {
  const { data } = await api.get<{ data: DashboardData }>("/dashboard", { params: consulta });
  return data.data;
};
