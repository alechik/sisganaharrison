import { Route } from "react-router-dom";
import TipoIngresoCreatePage from "../pages/TipoIngresoCreatePage";
import TipoIngresoDeletedPage from "../pages/TipoIngresoDeletedPage";
import TipoIngresoDetailPage from "../pages/TipoIngresoDetailPage";
import TipoIngresoEditPage from "../pages/TipoIngresoEditPage";
import TipoIngresoListPage from "../pages/TipoIngresoListPage";
import { TIPO_INGRESO_ROUTES } from "../constants";

export const tipoIngresoRoutes = (
  <>
    <Route path={TIPO_INGRESO_ROUTES.list} element={<TipoIngresoListPage />} />
    <Route path={TIPO_INGRESO_ROUTES.create} element={<TipoIngresoCreatePage />} />
    <Route path={TIPO_INGRESO_ROUTES.deleted} element={<TipoIngresoDeletedPage />} />
    <Route path={`${TIPO_INGRESO_ROUTES.list}/:id`} element={<TipoIngresoDetailPage />} />
    <Route path={`${TIPO_INGRESO_ROUTES.list}/:id/editar`} element={<TipoIngresoEditPage />} />
  </>
);

export {
  TipoIngresoListPage,
  TipoIngresoCreatePage,
  TipoIngresoEditPage,
  TipoIngresoDetailPage,
  TipoIngresoDeletedPage,
};
