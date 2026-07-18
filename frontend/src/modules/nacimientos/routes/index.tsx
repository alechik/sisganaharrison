import { Route } from "react-router-dom";
import NacimientoCreatePage from "../pages/NacimientoCreatePage";
import NacimientoDetailPage from "../pages/NacimientoDetailPage";
import NacimientoEditPage from "../pages/NacimientoEditPage";
import NacimientoListPage from "../pages/NacimientoListPage";
import { NACIMIENTO_ROUTES } from "../constants";

export const nacimientoRoutes = (
  <>
    <Route path={NACIMIENTO_ROUTES.list} element={<NacimientoListPage />} />
    <Route path={NACIMIENTO_ROUTES.create} element={<NacimientoCreatePage />} />
    <Route path={`${NACIMIENTO_ROUTES.list}/:id`} element={<NacimientoDetailPage />} />
    <Route path={`${NACIMIENTO_ROUTES.list}/:id/editar`} element={<NacimientoEditPage />} />
  </>
);

export { NacimientoListPage, NacimientoCreatePage, NacimientoEditPage, NacimientoDetailPage };
