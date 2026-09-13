import { Route } from "react-router-dom";
import { CUARENTENA_ROUTES, ORDEN_COMPRA_ROUTES } from "../constants";
import CuarentenaCreatePage from "../pages/CuarentenaCreatePage";
import CuarentenaDetailPage from "../pages/CuarentenaDetailPage";
import CuarentenaEditPage from "../pages/CuarentenaEditPage";
import CuarentenaListPage from "../pages/CuarentenaListPage";
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
    <Route path={CUARENTENA_ROUTES.list} element={<CuarentenaListPage />} />
    <Route path={CUARENTENA_ROUTES.create} element={<CuarentenaCreatePage />} />
    <Route path="/compras/cuarentenas/:id/editar" element={<CuarentenaEditPage />} />
    <Route path="/compras/cuarentenas/:id" element={<CuarentenaDetailPage />} />
  </>
);
