import { Route } from "react-router-dom";
import { ORDEN_PRODUCTO_ROUTES } from "./constants";
import IngresoProductoCreatePage from "./pages/IngresoProductoCreatePage";
import IngresoProductoDetailPage from "./pages/IngresoProductoDetailPage";
import IngresoProductoListPage from "./pages/IngresoProductoListPage";
import OrdenProductoCreatePage from "./pages/OrdenProductoCreatePage";
import OrdenProductoDetailPage from "./pages/OrdenProductoDetailPage";
import OrdenProductoEditPage from "./pages/OrdenProductoEditPage";
import OrdenProductoListPage from "./pages/OrdenProductoListPage";

export const comprasProductosRoutes = (
  <>
    <Route path={ORDEN_PRODUCTO_ROUTES.list} element={<OrdenProductoListPage />} />
    <Route path={ORDEN_PRODUCTO_ROUTES.create} element={<OrdenProductoCreatePage />} />
    <Route path="/compras-productos/ordenes/:id/editar" element={<OrdenProductoEditPage />} />
    <Route path="/compras-productos/ordenes/:id" element={<OrdenProductoDetailPage />} />
    <Route path="/compras-productos/ingresos" element={<IngresoProductoListPage />} />
    <Route path="/compras-productos/ingresos/crear" element={<IngresoProductoCreatePage />} />
    <Route path="/compras-productos/ingresos/:id" element={<IngresoProductoDetailPage />} />
  </>
);
