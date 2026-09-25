import { Route } from "react-router-dom";
import { TIPO_SALIDA_ROUTES } from "../constants";
import TipoSalidaCreatePage from "../pages/TipoSalidaCreatePage";
import TipoSalidaDeletedPage from "../pages/TipoSalidaDeletedPage";
import TipoSalidaDetailPage from "../pages/TipoSalidaDetailPage";
import TipoSalidaEditPage from "../pages/TipoSalidaEditPage";
import TipoSalidaListPage from "../pages/TipoSalidaListPage";

export const tipoSalidaRoutes = (
  <>
    <Route path={TIPO_SALIDA_ROUTES.list} element={<TipoSalidaListPage />} />
    <Route path={TIPO_SALIDA_ROUTES.create} element={<TipoSalidaCreatePage />} />
    <Route path={TIPO_SALIDA_ROUTES.deleted} element={<TipoSalidaDeletedPage />} />
    <Route path={`${TIPO_SALIDA_ROUTES.list}/:id`} element={<TipoSalidaDetailPage />} />
    <Route path={`${TIPO_SALIDA_ROUTES.list}/:id/editar`} element={<TipoSalidaEditPage />} />
  </>
);

export {
  TipoSalidaListPage,
  TipoSalidaCreatePage,
  TipoSalidaEditPage,
  TipoSalidaDetailPage,
  TipoSalidaDeletedPage,
};
