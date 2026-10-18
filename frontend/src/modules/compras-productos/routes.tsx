import { Route } from "react-router-dom";
import IngresoProductoCreatePage from "./pages/IngresoProductoCreatePage";
import IngresoProductoDetailPage from "./pages/IngresoProductoDetailPage";
import IngresoProductoListPage from "./pages/IngresoProductoListPage";
import OrdenProductoCreatePage from "./pages/OrdenProductoCreatePage";
import OrdenProductoDetailPage from "./pages/OrdenProductoDetailPage";
import OrdenProductoListPage from "./pages/OrdenProductoListPage";

export const comprasProductosRoutes = (
  <>
    <Route path="/compras-productos/ordenes" element={<OrdenProductoListPage />} />
    <Route path="/compras-productos/ordenes/crear" element={<OrdenProductoCreatePage />} />
    <Route path="/compras-productos/ordenes/:id" element={<OrdenProductoDetailPage />} />
    <Route path="/compras-productos/ingresos" element={<IngresoProductoListPage />} />
    <Route path="/compras-productos/ingresos/crear" element={<IngresoProductoCreatePage />} />
    <Route path="/compras-productos/ingresos/:id" element={<IngresoProductoDetailPage />} />
  </>
);
