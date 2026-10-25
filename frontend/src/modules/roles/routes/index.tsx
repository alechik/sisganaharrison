import { Route } from "react-router-dom";
import RoleDetailPage from "../pages/RoleDetailPage";
import RoleEditPage from "../pages/RoleEditPage";
import RoleListPage from "../pages/RoleListPage";
import { ROLE_ROUTES } from "../constants";

export const roleRoutes = (
  <>
    <Route path={ROLE_ROUTES.list} element={<RoleListPage />} />
    <Route path={`${ROLE_ROUTES.list}/:id`} element={<RoleDetailPage />} />
    <Route path={`${ROLE_ROUTES.list}/:id/editar`} element={<RoleEditPage />} />
  </>
);
