import { Route } from "react-router-dom";
import RazaCreatePage from "../pages/RazaCreatePage";
import RazaDeletedPage from "../pages/RazaDeletedPage";
import RazaDetailPage from "../pages/RazaDetailPage";
import RazaEditPage from "../pages/RazaEditPage";
import RazaListPage from "../pages/RazaListPage";
import { RAZA_ROUTES } from "../constants";

export const razaRoutes = (
  <>
    <Route path={RAZA_ROUTES.list} element={<RazaListPage />} />
    <Route path={RAZA_ROUTES.create} element={<RazaCreatePage />} />
    <Route path={RAZA_ROUTES.deleted} element={<RazaDeletedPage />} />
    <Route path={`${RAZA_ROUTES.list}/:id`} element={<RazaDetailPage />} />
    <Route path={`${RAZA_ROUTES.list}/:id/editar`} element={<RazaEditPage />} />
  </>
);

export {
  RazaListPage,
  RazaCreatePage,
  RazaEditPage,
  RazaDetailPage,
  RazaDeletedPage,
};
