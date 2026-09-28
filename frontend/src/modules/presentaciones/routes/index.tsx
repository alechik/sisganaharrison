import { Route } from "react-router-dom";
import { PRESENTACION_ROUTES } from "../constants";
import PresentacionCreatePage from "../pages/PresentacionCreatePage";
import PresentacionDeletedPage from "../pages/PresentacionDeletedPage";
import PresentacionDetailPage from "../pages/PresentacionDetailPage";
import PresentacionEditPage from "../pages/PresentacionEditPage";
import PresentacionListPage from "../pages/PresentacionListPage";

export const presentacionRoutes = (
  <>
    <Route path={PRESENTACION_ROUTES.list} element={<PresentacionListPage />} />
    <Route path={PRESENTACION_ROUTES.create} element={<PresentacionCreatePage />} />
    <Route path={PRESENTACION_ROUTES.deleted} element={<PresentacionDeletedPage />} />
    <Route path={`${PRESENTACION_ROUTES.list}/:id`} element={<PresentacionDetailPage />} />
    <Route path={`${PRESENTACION_ROUTES.list}/:id/editar`} element={<PresentacionEditPage />} />
  </>
);

export {
  PresentacionListPage,
  PresentacionCreatePage,
  PresentacionEditPage,
  PresentacionDetailPage,
  PresentacionDeletedPage,
};
