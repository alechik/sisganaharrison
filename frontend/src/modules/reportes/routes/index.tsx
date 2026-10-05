import { Route } from "react-router-dom";
import ReportePage from "../pages/ReportePage";
import { REPORTE_ROUTES } from "../constants";

export const reporteRoutes = (
  <Route path={REPORTE_ROUTES.list} element={<ReportePage />} />
);
