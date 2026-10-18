import { Route } from "react-router-dom";
import GrupoCreatePage from "../pages/GrupoCreatePage";
import GrupoDeletedPage from "../pages/GrupoDeletedPage";
import GrupoDetailPage from "../pages/GrupoDetailPage";
import GrupoEditPage from "../pages/GrupoEditPage";
import GrupoListPage from "../pages/GrupoListPage";
import { GRUPO_ROUTES } from "../constants";

export const grupoRoutes = (
  <>
    <Route path={GRUPO_ROUTES.list} element={<GrupoListPage />} />
    <Route path={GRUPO_ROUTES.create} element={<GrupoCreatePage />} />
    <Route path={GRUPO_ROUTES.deleted} element={<GrupoDeletedPage />} />
    <Route path={`${GRUPO_ROUTES.list}/:id`} element={<GrupoDetailPage />} />
    <Route path={`${GRUPO_ROUTES.list}/:id/editar`} element={<GrupoEditPage />} />
  </>
);
