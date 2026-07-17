import { Route } from "react-router-dom";
import PesajeCreatePage from "../pages/PesajeCreatePage";
import PesajeDetailPage from "../pages/PesajeDetailPage";
import PesajeListPage from "../pages/PesajeListPage";
import { PESAJE_ROUTES } from "../constants";

export const pesajeRoutes = (
  <>
    <Route path={PESAJE_ROUTES.list} element={<PesajeListPage />} />
    <Route path={PESAJE_ROUTES.create} element={<PesajeCreatePage />} />
    <Route path={`${PESAJE_ROUTES.list}/:id`} element={<PesajeDetailPage />} />
  </>
);

export {
  PesajeListPage,
  PesajeCreatePage,
  PesajeDetailPage,
};
