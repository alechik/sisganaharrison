import { Route } from "react-router-dom";
import VacunaCreatePage from "../pages/VacunaCreatePage";
import VacunaDeletedPage from "../pages/VacunaDeletedPage";
import VacunaDetailPage from "../pages/VacunaDetailPage";
import VacunaEditPage from "../pages/VacunaEditPage";
import VacunaListPage from "../pages/VacunaListPage";
import { VACUNA_ROUTES } from "../constants";

export const vacunaRoutes = (
  <>
    <Route path={VACUNA_ROUTES.list} element={<VacunaListPage />} />
    <Route path={VACUNA_ROUTES.create} element={<VacunaCreatePage />} />
    <Route path={VACUNA_ROUTES.deleted} element={<VacunaDeletedPage />} />
    <Route path={`${VACUNA_ROUTES.list}/:id`} element={<VacunaDetailPage />} />
    <Route path={`${VACUNA_ROUTES.list}/:id/editar`} element={<VacunaEditPage />} />
  </>
);

export {
  VacunaListPage,
  VacunaCreatePage,
  VacunaEditPage,
  VacunaDetailPage,
  VacunaDeletedPage,
};
