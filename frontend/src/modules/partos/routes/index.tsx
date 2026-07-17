import { Route } from "react-router-dom";
import PartoCreatePage from "../pages/PartoCreatePage";
import PartoDetailPage from "../pages/PartoDetailPage";
import PartoEditPage from "../pages/PartoEditPage";
import PartoListPage from "../pages/PartoListPage";
import { PARTO_ROUTES } from "../constants";

export const partoRoutes = (
  <>
    <Route path={PARTO_ROUTES.list} element={<PartoListPage />} />
    <Route path={PARTO_ROUTES.create} element={<PartoCreatePage />} />
    <Route path={`${PARTO_ROUTES.list}/:id`} element={<PartoDetailPage />} />
    <Route path={`${PARTO_ROUTES.list}/:id/editar`} element={<PartoEditPage />} />
  </>
);

export { PartoListPage, PartoCreatePage, PartoEditPage, PartoDetailPage };
