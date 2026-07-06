import { Route } from "react-router-dom";
import TipoMovimientoCreatePage from "../pages/TipoMovimientoCreatePage";
import TipoMovimientoDeletedPage from "../pages/TipoMovimientoDeletedPage";
import TipoMovimientoDetailPage from "../pages/TipoMovimientoDetailPage";
import TipoMovimientoEditPage from "../pages/TipoMovimientoEditPage";
import TipoMovimientoListPage from "../pages/TipoMovimientoListPage";
import { TIPO_MOVIMIENTO_ROUTES } from "../constants";

export const tipoMovimientoRoutes = (
  <>
    <Route path={TIPO_MOVIMIENTO_ROUTES.list} element={<TipoMovimientoListPage />} />
    <Route path={TIPO_MOVIMIENTO_ROUTES.create} element={<TipoMovimientoCreatePage />} />
    <Route path={TIPO_MOVIMIENTO_ROUTES.deleted} element={<TipoMovimientoDeletedPage />} />
    <Route
      path={`${TIPO_MOVIMIENTO_ROUTES.list}/:id`}
      element={<TipoMovimientoDetailPage />}
    />
    <Route
      path={`${TIPO_MOVIMIENTO_ROUTES.list}/:id/editar`}
      element={<TipoMovimientoEditPage />}
    />
  </>
);

export {
  TipoMovimientoListPage,
  TipoMovimientoCreatePage,
  TipoMovimientoEditPage,
  TipoMovimientoDetailPage,
  TipoMovimientoDeletedPage,
};
