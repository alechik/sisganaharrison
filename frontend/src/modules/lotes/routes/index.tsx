import { Route } from "react-router-dom";
import LoteCreatePage from "../pages/LoteCreatePage";
import LoteDeletedPage from "../pages/LoteDeletedPage";
import LoteDetailPage from "../pages/LoteDetailPage";
import LoteEditPage from "../pages/LoteEditPage";
import LoteListPage from "../pages/LoteListPage";
import { LOTE_ROUTES } from "../constants";

export const loteRoutes = (
  <>
    <Route path={LOTE_ROUTES.list} element={<LoteListPage />} />
    <Route path={LOTE_ROUTES.create} element={<LoteCreatePage />} />
    <Route path={LOTE_ROUTES.deleted} element={<LoteDeletedPage />} />
    <Route path={`${LOTE_ROUTES.list}/:id`} element={<LoteDetailPage />} />
    <Route path={`${LOTE_ROUTES.list}/:id/editar`} element={<LoteEditPage />} />
  </>
);

export {
  LoteListPage,
  LoteCreatePage,
  LoteEditPage,
  LoteDetailPage,
  LoteDeletedPage,
};
