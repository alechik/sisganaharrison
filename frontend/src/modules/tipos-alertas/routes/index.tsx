import { Route } from "react-router-dom";
import TipoAlertaCreatePage from "../pages/TipoAlertaCreatePage";
import TipoAlertaDeletedPage from "../pages/TipoAlertaDeletedPage";
import TipoAlertaDetailPage from "../pages/TipoAlertaDetailPage";
import TipoAlertaEditPage from "../pages/TipoAlertaEditPage";
import TipoAlertaListPage from "../pages/TipoAlertaListPage";
import { TIPO_ALERTA_ROUTES } from "../constants";

export const tipoAlertaRoutes = (
  <>
    <Route path={TIPO_ALERTA_ROUTES.list} element={<TipoAlertaListPage />} />
    <Route path={TIPO_ALERTA_ROUTES.create} element={<TipoAlertaCreatePage />} />
    <Route path={TIPO_ALERTA_ROUTES.deleted} element={<TipoAlertaDeletedPage />} />
    <Route
      path={`${TIPO_ALERTA_ROUTES.list}/:id`}
      element={<TipoAlertaDetailPage />}
    />
    <Route
      path={`${TIPO_ALERTA_ROUTES.list}/:id/editar`}
      element={<TipoAlertaEditPage />}
    />
  </>
);

export {
  TipoAlertaListPage,
  TipoAlertaCreatePage,
  TipoAlertaEditPage,
  TipoAlertaDetailPage,
  TipoAlertaDeletedPage,
};
