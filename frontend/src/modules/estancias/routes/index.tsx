import { Route } from "react-router-dom";
import EstanciaCreatePage from "../pages/EstanciaCreatePage";
import EstanciaDeletedPage from "../pages/EstanciaDeletedPage";
import EstanciaDetailPage from "../pages/EstanciaDetailPage";
import EstanciaEditPage from "../pages/EstanciaEditPage";
import EstanciaListPage from "../pages/EstanciaListPage";
import { ESTANCIA_ROUTES } from "../constants";

export const estanciaRoutes = (
  <>
    <Route path={ESTANCIA_ROUTES.list} element={<EstanciaListPage />} />
    <Route path={ESTANCIA_ROUTES.create} element={<EstanciaCreatePage />} />
    <Route path={ESTANCIA_ROUTES.deleted} element={<EstanciaDeletedPage />} />
    <Route
      path={`${ESTANCIA_ROUTES.list}/:id`}
      element={<EstanciaDetailPage />}
    />
    <Route
      path={`${ESTANCIA_ROUTES.list}/:id/editar`}
      element={<EstanciaEditPage />}
    />
  </>
);

export {
  EstanciaListPage,
  EstanciaCreatePage,
  EstanciaEditPage,
  EstanciaDetailPage,
  EstanciaDeletedPage,
};
