import { Route } from "react-router-dom";
import { ORDEN_COMPRA_ROUTES } from "../constants";
import OrdenCompraCreatePage from "../pages/OrdenCompraCreatePage";
import OrdenCompraDetailPage from "../pages/OrdenCompraDetailPage";
import OrdenCompraEditPage from "../pages/OrdenCompraEditPage";
import OrdenCompraListPage from "../pages/OrdenCompraListPage";

export const comprasRoutes = (
  <>
    <Route path={ORDEN_COMPRA_ROUTES.list} element={<OrdenCompraListPage />} />
    <Route path={ORDEN_COMPRA_ROUTES.create} element={<OrdenCompraCreatePage />} />
    <Route path="/compras/ordenes-compra/:id/editar" element={<OrdenCompraEditPage />} />
    <Route path="/compras/ordenes-compra/:id" element={<OrdenCompraDetailPage />} />
  </>
);
