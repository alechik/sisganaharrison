import { Route } from "react-router-dom";
import PotreroCreatePage from "../pages/PotreroCreatePage";
import PotreroDeletedPage from "../pages/PotreroDeletedPage";
import PotreroDetailPage from "../pages/PotreroDetailPage";
import PotreroEditPage from "../pages/PotreroEditPage";
import PotreroListPage from "../pages/PotreroListPage";
import { POTRERO_ROUTES } from "../constants";

export const potreroRoutes = (
  <>
    <Route path={POTRERO_ROUTES.list} element={<PotreroListPage />} />
    <Route path={POTRERO_ROUTES.create} element={<PotreroCreatePage />} />
    <Route path={POTRERO_ROUTES.deleted} element={<PotreroDeletedPage />} />
    <Route path={`${POTRERO_ROUTES.list}/:id`} element={<PotreroDetailPage />} />
    <Route path={`${POTRERO_ROUTES.list}/:id/editar`} element={<PotreroEditPage />} />
  </>
);

export {
  PotreroListPage,
  PotreroCreatePage,
  PotreroEditPage,
  PotreroDetailPage,
  PotreroDeletedPage,
};
