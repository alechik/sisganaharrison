import { Route } from "react-router-dom";
import { CUARENTENA_ROUTES, INGRESO_ROUTES, ORDEN_COMPRA_ROUTES } from "../constants";
import CuarentenaCreatePage from "../pages/CuarentenaCreatePage";
import CuarentenaDetailPage from "../pages/CuarentenaDetailPage";
import CuarentenaEditPage from "../pages/CuarentenaEditPage";
import CuarentenaListPage from "../pages/CuarentenaListPage";
import IngresoCreatePage from "../pages/IngresoCreatePage";
import IngresoDetailPage from "../pages/IngresoDetailPage";
import IngresoListPage from "../pages/IngresoListPage";
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
    <Route path={INGRESO_ROUTES.list} element={<IngresoListPage />} />
    <Route path={INGRESO_ROUTES.create} element={<IngresoCreatePage />} />
    <Route path="/compras/ingresos/:id" element={<IngresoDetailPage />} />
  </>
);
