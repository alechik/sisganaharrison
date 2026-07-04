import { Route } from "react-router-dom";
import TipoEventoSanitarioCreatePage from "../pages/TipoEventoSanitarioCreatePage";
import TipoEventoSanitarioDeletedPage from "../pages/TipoEventoSanitarioDeletedPage";
import TipoEventoSanitarioDetailPage from "../pages/TipoEventoSanitarioDetailPage";
import TipoEventoSanitarioEditPage from "../pages/TipoEventoSanitarioEditPage";
import TipoEventoSanitarioListPage from "../pages/TipoEventoSanitarioListPage";
import { TIPO_EVENTO_SANITARIO_ROUTES } from "../constants";

export const tipoEventoSanitarioRoutes = (
  <>
    <Route path={TIPO_EVENTO_SANITARIO_ROUTES.list} element={<TipoEventoSanitarioListPage />} />
    <Route path={TIPO_EVENTO_SANITARIO_ROUTES.create} element={<TipoEventoSanitarioCreatePage />} />
    <Route path={TIPO_EVENTO_SANITARIO_ROUTES.deleted} element={<TipoEventoSanitarioDeletedPage />} />
    <Route
      path={`${TIPO_EVENTO_SANITARIO_ROUTES.list}/:id`}
      element={<TipoEventoSanitarioDetailPage />}
    />
    <Route
      path={`${TIPO_EVENTO_SANITARIO_ROUTES.list}/:id/editar`}
      element={<TipoEventoSanitarioEditPage />}
    />
  </>
);

export {
  TipoEventoSanitarioListPage,
  TipoEventoSanitarioCreatePage,
  TipoEventoSanitarioEditPage,
  TipoEventoSanitarioDetailPage,
  TipoEventoSanitarioDeletedPage,
};
