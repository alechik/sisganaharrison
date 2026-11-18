import { Route } from "react-router-dom";
import ParcelaCreatePage from "../pages/ParcelaCreatePage";
import ParcelaDeletedPage from "../pages/ParcelaDeletedPage";
import ParcelaDetailPage from "../pages/ParcelaDetailPage";
import ParcelaEditPage from "../pages/ParcelaEditPage";
import ParcelaListPage from "../pages/ParcelaListPage";
import { PARCELA_ROUTES } from "../constants";

export const parcelaRoutes = (
  <>
    <Route path={PARCELA_ROUTES.list} element={<ParcelaListPage />} />
    <Route path={PARCELA_ROUTES.create} element={<ParcelaCreatePage />} />
    <Route path={PARCELA_ROUTES.deleted} element={<ParcelaDeletedPage />} />
    <Route path={`${PARCELA_ROUTES.list}/:id`} element={<ParcelaDetailPage />} />
    <Route path={`${PARCELA_ROUTES.list}/:id/editar`} element={<ParcelaEditPage />} />
  </>
);

export {
  ParcelaListPage,
  ParcelaCreatePage,
  ParcelaEditPage,
  ParcelaDetailPage,
  ParcelaDeletedPage,
};
