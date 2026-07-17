import { Route } from "react-router-dom";
import GestacionCreatePage from "../pages/GestacionCreatePage";
import GestacionDetailPage from "../pages/GestacionDetailPage";
import GestacionEditPage from "../pages/GestacionEditPage";
import GestacionListPage from "../pages/GestacionListPage";
import { GESTACION_ROUTES } from "../constants";

export const gestacionRoutes = (
  <>
    <Route path={GESTACION_ROUTES.list} element={<GestacionListPage />} />
    <Route path={GESTACION_ROUTES.create} element={<GestacionCreatePage />} />
    <Route path={`${GESTACION_ROUTES.list}/:id`} element={<GestacionDetailPage />} />
    <Route path={`${GESTACION_ROUTES.list}/:id/editar`} element={<GestacionEditPage />} />
  </>
);

export {
  GestacionListPage,
  GestacionCreatePage,
  GestacionEditPage,
  GestacionDetailPage,
};
