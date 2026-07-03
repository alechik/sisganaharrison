import { Route } from "react-router-dom";
import EstadoProductivoCreatePage from "../pages/EstadoProductivoCreatePage";
import EstadoProductivoDeletedPage from "../pages/EstadoProductivoDeletedPage";
import EstadoProductivoDetailPage from "../pages/EstadoProductivoDetailPage";
import EstadoProductivoEditPage from "../pages/EstadoProductivoEditPage";
import EstadoProductivoListPage from "../pages/EstadoProductivoListPage";
import { ESTADO_PRODUCTIVO_ROUTES } from "../constants";

export const estadoProductivoRoutes = (
  <>
    <Route path={ESTADO_PRODUCTIVO_ROUTES.list} element={<EstadoProductivoListPage />} />
    <Route path={ESTADO_PRODUCTIVO_ROUTES.create} element={<EstadoProductivoCreatePage />} />
    <Route path={ESTADO_PRODUCTIVO_ROUTES.deleted} element={<EstadoProductivoDeletedPage />} />
    <Route
      path={`${ESTADO_PRODUCTIVO_ROUTES.list}/:id`}
      element={<EstadoProductivoDetailPage />}
    />
    <Route
      path={`${ESTADO_PRODUCTIVO_ROUTES.list}/:id/editar`}
      element={<EstadoProductivoEditPage />}
    />
  </>
);

export {
  EstadoProductivoListPage,
  EstadoProductivoCreatePage,
  EstadoProductivoEditPage,
  EstadoProductivoDetailPage,
  EstadoProductivoDeletedPage,
};
