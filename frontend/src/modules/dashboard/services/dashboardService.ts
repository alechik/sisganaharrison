import api from "@/api/axios";
import { DashboardData } from "../types";

export const getDashboard = async (): Promise<DashboardData> => {
  const { data } = await api.get<{ data: DashboardData }>("/dashboard");
  return data.data;
};
