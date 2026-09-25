import { Route } from "react-router-dom";
import { VENTA_ROUTES } from "../constants";
import VentaCreatePage from "../pages/VentaCreatePage";
import VentaDetailPage from "../pages/VentaDetailPage";
import VentaEditPage from "../pages/VentaEditPage";
import VentaListPage from "../pages/VentaListPage";

export const ventasRoutes = (
  <>
    <Route path={VENTA_ROUTES.list} element={<VentaListPage />} />
    <Route path={VENTA_ROUTES.create} element={<VentaCreatePage />} />
    <Route path="/ventas/:id/editar" element={<VentaEditPage />} />
    <Route path="/ventas/:id" element={<VentaDetailPage />} />
  </>
);
